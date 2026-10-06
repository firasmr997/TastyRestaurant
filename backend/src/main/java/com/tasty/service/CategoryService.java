package com.tasty.service;

import com.tasty.dto.category.CategoryDto;
import com.tasty.dto.category.CategoryRequest;
import com.tasty.dto.common.PageResponse;
import com.tasty.entity.Category;
import com.tasty.exception.BadRequestException;
import com.tasty.exception.ConflictException;
import com.tasty.exception.ResourceNotFoundException;
import com.tasty.mapper.CategoryMapper;
import com.tasty.repository.CategoryRepository;
import com.tasty.repository.MenuItemRepository;
import com.tasty.repository.spec.CategorySpecifications;
import com.tasty.security.CurrentUser;
import com.tasty.util.SlugUtils;
import com.tasty.util.Text;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private static final int SLUG_MAX_LENGTH = 100;
    private static final Sort DISPLAY_ORDER = Sort.by(Sort.Order.asc("displayOrder"), Sort.Order.asc("name"));

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final CategoryMapper categoryMapper;

    /**
     * Lists categories in display order. Guests only ever see active categories; staff may filter on
     * {@code active} or see everything.
     */
    @Transactional(readOnly = true)
    public PageResponse<CategoryDto> list(String query, Boolean active, int page, int size) {
        Boolean activeFilter = CurrentUser.isStaff() ? active : Boolean.TRUE;
        Page<Category> result = categoryRepository.findAll(
                CategorySpecifications.filter(query, activeFilter), PageRequest.of(page, size, DISPLAY_ORDER));
        Map<Long, Long> counts = itemCounts(result);
        return PageResponse.from(result, c -> categoryMapper.toDto(c, counts.getOrDefault(c.getId(), 0L)));
    }

    @Transactional(readOnly = true)
    public CategoryDto get(Long id) {
        Category category = findVisible(categoryRepository.findById(id).orElse(null), id);
        return categoryMapper.toDto(category, menuItemRepository.countByCategoryId(category.getId()));
    }

    @Transactional(readOnly = true)
    public CategoryDto getBySlug(String slug) {
        Category category = findVisible(categoryRepository.findBySlug(slug).orElse(null), slug);
        return categoryMapper.toDto(category, menuItemRepository.countByCategoryId(category.getId()));
    }

    @Transactional
    public CategoryDto create(CategoryRequest request) {
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("A category named \"" + name + "\" already exists");
        }
        Category category = new Category();
        categoryMapper.apply(request, category);
        category.setSlug(resolveSlug(request.slug(), name, null));
        Category saved = categoryRepository.save(category);
        log.info("Category created: {} ({})", saved.getName(), saved.getId());
        return categoryMapper.toDto(saved, 0);
    }

    @Transactional
    public CategoryDto update(Long id, CategoryRequest request) {
        Category category = require(id);
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("A category named \"" + name + "\" already exists");
        }
        categoryMapper.apply(request, category);
        // Slugs back public URLs, so they only change when an explicit new slug is sent.
        String requestedSlug = Text.clean(request.slug());
        if (requestedSlug != null && !requestedSlug.equals(category.getSlug())) {
            category.setSlug(resolveSlug(requestedSlug, name, id));
        }
        return categoryMapper.toDto(category, menuItemRepository.countByCategoryId(id));
    }

    /**
     * Deletes a category. When dishes still belong to it, the caller must name a category to move them
     * to ({@code reassignTo}); otherwise the request is refused so no dish is silently orphaned or removed.
     */
    @Transactional
    public void delete(Long id, Long reassignTo) {
        Category category = require(id);
        long dishes = menuItemRepository.countByCategoryId(id);
        if (dishes > 0) {
            if (reassignTo == null) {
                throw new ConflictException("\"" + category.getName() + "\" still has " + dishes
                        + (dishes == 1 ? " dish" : " dishes") + ". Move them to another category before deleting it.");
            }
            if (reassignTo.equals(id)) {
                throw new BadRequestException("Choose a different category to move the dishes to");
            }
            Category target = categoryRepository.findById(reassignTo)
                    .orElseThrow(() -> new BadRequestException("The target category does not exist"));
            int moved = menuItemRepository.reassignCategory(category, target, Instant.now(), CurrentUser.auditorName());
            log.info("Moved {} dishes from category {} to {}", moved, id, reassignTo);
            category = require(id);
        }
        categoryRepository.delete(category);
        log.info("Category deleted: {} ({})", category.getName(), id);
    }

    private String resolveSlug(String requested, String name, Long currentId) {
        String base = Text.clean(requested) != null ? SlugUtils.slugify(requested) : SlugUtils.slugify(name);
        return SlugUtils.unique(base, SLUG_MAX_LENGTH, candidate -> currentId == null
                ? categoryRepository.existsBySlug(candidate)
                : categoryRepository.existsBySlugAndIdNot(candidate, currentId));
    }

    private Category require(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Category", id));
    }

    private Category findVisible(Category category, Object identifier) {
        if (category == null || (!category.isActive() && !CurrentUser.isStaff())) {
            throw ResourceNotFoundException.of("Category", identifier);
        }
        return category;
    }

    private Map<Long, Long> itemCounts(Page<Category> page) {
        if (page.isEmpty()) {
            return Map.of();
        }
        var ids = page.getContent().stream().map(Category::getId).toList();
        return menuItemRepository.countPerCategory(ids).stream()
                .collect(Collectors.toMap(MenuItemRepository.CategoryCount::getCategoryId,
                        MenuItemRepository.CategoryCount::getTotal));
    }
}

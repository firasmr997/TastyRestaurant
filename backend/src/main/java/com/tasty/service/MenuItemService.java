package com.tasty.service;

import com.tasty.dto.common.PageResponse;
import com.tasty.dto.menu.ImageRequest;
import com.tasty.dto.menu.MenuItemDto;
import com.tasty.dto.menu.MenuItemRequest;
import com.tasty.dto.menu.MenuItemStatusRequest;
import com.tasty.dto.menu.MenuItemSummaryDto;
import com.tasty.entity.Category;
import com.tasty.entity.MenuItem;
import com.tasty.entity.MenuItemImage;
import com.tasty.exception.BadRequestException;
import com.tasty.exception.ResourceNotFoundException;
import com.tasty.mapper.MenuItemMapper;
import com.tasty.repository.CategoryRepository;
import com.tasty.repository.MenuItemRepository;
import com.tasty.repository.spec.MenuItemSpecifications;
import com.tasty.repository.spec.MenuItemSpecifications.MenuFilter;
import com.tasty.security.CurrentUser;
import com.tasty.util.SlugUtils;
import com.tasty.util.Text;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuItemService {

    private static final int SLUG_MAX_LENGTH = 140;

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemMapper menuItemMapper;
    private final ImageCleanupService imageCleanup;

    /** Menu search. Guests never see dishes from hidden categories. */
    @Transactional(readOnly = true)
    public PageResponse<MenuItemSummaryDto> search(MenuSearch search, int page, int size) {
        MenuFilter filter = new MenuFilter(
                search.query(), search.categoryId(), Text.clean(search.categorySlug()),
                search.available(), search.featured(), search.vegetarian(), search.spicy(),
                CurrentUser.isStaff());
        var result = menuItemRepository.findAll(MenuItemSpecifications.filter(filter),
                PageRequest.of(page, size, search.sort().toSort()));
        return PageResponse.from(result, menuItemMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public MenuItemDto get(Long id) {
        return menuItemMapper.toDto(visible(menuItemRepository.findWithDetailsById(id), id));
    }

    @Transactional(readOnly = true)
    public MenuItemDto getBySlug(String slug) {
        return menuItemMapper.toDto(visible(menuItemRepository.findWithDetailsBySlug(slug), slug));
    }

    @Transactional
    public MenuItemDto create(MenuItemRequest request) {
        MenuItem item = new MenuItem();
        menuItemMapper.apply(request, item);
        item.setCategory(requireCategory(request.categoryId()));
        item.setSlug(resolveSlug(request.slug(), request.name(), null));
        applyMainImage(item, request.mainImage());
        replaceAdditionalImages(item, request.additionalImages());
        MenuItem saved = menuItemRepository.save(item);
        log.info("Dish created: {} ({})", saved.getName(), saved.getId());
        return menuItemMapper.toDto(saved);
    }

    @Transactional
    public MenuItemDto update(Long id, MenuItemRequest request) {
        MenuItem item = require(id);
        List<String> previousKeys = MenuItemMapper.storageKeys(item);

        menuItemMapper.apply(request, item);
        if (!item.getCategory().getId().equals(request.categoryId())) {
            item.setCategory(requireCategory(request.categoryId()));
        }
        String requestedSlug = Text.clean(request.slug());
        if (requestedSlug != null && !requestedSlug.equals(item.getSlug())) {
            item.setSlug(resolveSlug(requestedSlug, request.name(), id));
        }
        applyMainImage(item, request.mainImage());
        replaceAdditionalImages(item, request.additionalImages());

        Set<String> removed = new HashSet<>(previousKeys);
        removed.removeAll(MenuItemMapper.storageKeys(item));
        imageCleanup.deleteUnreferencedAfterCommit(removed);
        return menuItemMapper.toDto(item);
    }

    @Transactional
    public MenuItemSummaryDto updateStatus(Long id, MenuItemStatusRequest request) {
        MenuItem item = menuItemRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Dish", id));
        if (request.available() != null) {
            item.setAvailable(request.available());
        }
        if (request.featured() != null) {
            item.setFeatured(request.featured());
        }
        return menuItemMapper.toSummary(item);
    }

    @Transactional
    public void delete(Long id) {
        MenuItem item = require(id);
        List<String> keys = MenuItemMapper.storageKeys(item);
        menuItemRepository.delete(item);
        imageCleanup.deleteUnreferencedAfterCommit(keys);
        log.info("Dish deleted: {} ({})", item.getName(), id);
    }

    private void applyMainImage(MenuItem item, ImageRequest image) {
        if (image == null) {
            item.setMainImageUrl(null);
            item.setMainImageKey(null);
            item.setMainImageAlt(null);
            return;
        }
        item.setMainImageUrl(image.url().trim());
        item.setMainImageKey(Text.clean(image.storageKey()));
        item.setMainImageAlt(Text.clean(image.altText()));
    }

    /** Additional photos are replaced as a whole, keeping the submitted order. */
    private void replaceAdditionalImages(MenuItem item, List<ImageRequest> images) {
        item.getImages().clear();
        if (images == null) {
            return;
        }
        int order = 0;
        for (ImageRequest image : images) {
            MenuItemImage entity = new MenuItemImage();
            entity.setImageUrl(image.url().trim());
            entity.setStorageKey(Text.clean(image.storageKey()));
            entity.setAltText(Text.clean(image.altText()));
            entity.setSortOrder(order++);
            item.addImage(entity);
        }
    }

    private String resolveSlug(String requested, String name, Long currentId) {
        String base = Text.clean(requested) != null ? SlugUtils.slugify(requested) : SlugUtils.slugify(name);
        return SlugUtils.unique(base, SLUG_MAX_LENGTH, candidate -> currentId == null
                ? menuItemRepository.existsBySlug(candidate)
                : menuItemRepository.existsBySlugAndIdNot(candidate, currentId));
    }

    private Category requireCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BadRequestException("Category " + categoryId + " does not exist"));
    }

    private MenuItem require(Long id) {
        return menuItemRepository.findWithDetailsById(id).orElseThrow(() -> ResourceNotFoundException.of("Dish", id));
    }

    private MenuItem visible(Optional<MenuItem> candidate, Object identifier) {
        MenuItem item = candidate.orElseThrow(() -> ResourceNotFoundException.of("Dish", identifier));
        if (!item.getCategory().isActive() && !CurrentUser.isStaff()) {
            throw ResourceNotFoundException.of("Dish", identifier);
        }
        return item;
    }

    /** Search criteria as received from the API. */
    public record MenuSearch(String query, Long categoryId, String categorySlug, Boolean available, Boolean featured,
                             Boolean vegetarian, Boolean spicy, MenuSort sort) {
    }

    /** Named sort orders, so clients never pass raw property paths. */
    public enum MenuSort {
        MENU, NEWEST, UPDATED, NAME, PRICE_ASC, PRICE_DESC;

        public Sort toSort() {
            return switch (this) {
                case MENU -> Sort.by(Sort.Order.asc("category.displayOrder"), Sort.Order.asc("category.id"),
                        Sort.Order.desc("featured"), Sort.Order.asc("name"));
                case NEWEST -> Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
                case UPDATED -> Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("id"));
                case NAME -> Sort.by(Sort.Order.asc("name"), Sort.Order.asc("id"));
                case PRICE_ASC -> Sort.by(Sort.Order.asc("price"), Sort.Order.asc("name"));
                case PRICE_DESC -> Sort.by(Sort.Order.desc("price"), Sort.Order.asc("name"));
            };
        }

        public static MenuSort parse(String value) {
            if (value == null || value.isBlank()) {
                return MENU;
            }
            try {
                return valueOf(value.trim().toUpperCase().replace('-', '_'));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Unknown sort '" + value + "'. Use menu, newest, updated, name, price-asc or price-desc");
            }
        }
    }
}

package com.tasty.service;

import com.tasty.dto.common.PageResponse;
import com.tasty.dto.gallery.GalleryImageDto;
import com.tasty.dto.gallery.GalleryImageRequest;
import com.tasty.entity.GalleryCategory;
import com.tasty.entity.GalleryGroup;
import com.tasty.entity.GalleryImage;
import com.tasty.entity.MenuItem;
import com.tasty.exception.BadRequestException;
import com.tasty.exception.ResourceNotFoundException;
import com.tasty.mapper.GalleryImageMapper;
import com.tasty.repository.GalleryImageRepository;
import com.tasty.repository.MenuItemRepository;
import com.tasty.repository.spec.GallerySpecifications;
import com.tasty.repository.spec.GallerySpecifications.GalleryFilter;
import com.tasty.util.Text;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class GalleryService {

    private static final Sort GALLERY_ORDER = Sort.by(
            Sort.Order.desc("featured"), Sort.Order.asc("displayOrder"), Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
    private static final Sort NEWEST = Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));

    private final GalleryImageRepository galleryRepository;
    private final MenuItemRepository menuItemRepository;
    private final GalleryImageMapper galleryMapper;
    private final ImageCleanupService imageCleanup;

    @Transactional(readOnly = true)
    public PageResponse<GalleryImageDto> list(GalleryGroup group, List<GalleryCategory> categories, Boolean featured,
                                             Long menuItemId, String query, boolean newestFirst, int page, int size) {
        var filter = new GalleryFilter(group, categories, featured, menuItemId, query);
        var result = galleryRepository.findAll(GallerySpecifications.filter(filter),
                PageRequest.of(page, size, newestFirst ? NEWEST : GALLERY_ORDER));
        return PageResponse.from(result, galleryMapper::toDto);
    }

    @Transactional(readOnly = true)
    public GalleryImageDto get(Long id) {
        return galleryMapper.toDto(require(id));
    }

    @Transactional
    public GalleryImageDto create(GalleryImageRequest request) {
        GalleryImage image = new GalleryImage();
        galleryMapper.apply(request, image);
        image.setImageUrl(request.imageUrl().trim());
        image.setStorageKey(Text.clean(request.storageKey()));
        image.setMenuItem(resolveMenuItem(request.menuItemId()));
        GalleryImage saved = galleryRepository.save(image);
        log.info("Gallery image created: {} ({})", saved.getTitle(), saved.getId());
        return galleryMapper.toDto(saved);
    }

    /** Updates metadata and, when a new image URL/key is sent, replaces the photo and deletes the old file. */
    @Transactional
    public GalleryImageDto update(Long id, GalleryImageRequest request) {
        GalleryImage image = require(id);
        String previousKey = image.getStorageKey();
        galleryMapper.apply(request, image);
        image.setImageUrl(request.imageUrl().trim());
        image.setStorageKey(Text.clean(request.storageKey()));
        image.setMenuItem(resolveMenuItem(request.menuItemId()));
        if (previousKey != null && !Objects.equals(previousKey, image.getStorageKey())) {
            imageCleanup.deleteUnreferencedAfterCommit(List.of(previousKey));
        }
        return galleryMapper.toDto(image);
    }

    @Transactional
    public void delete(Long id) {
        GalleryImage image = require(id);
        String key = image.getStorageKey();
        galleryRepository.delete(image);
        if (key != null) {
            imageCleanup.deleteUnreferencedAfterCommit(List.of(key));
        }
        log.info("Gallery image deleted: {} ({})", image.getTitle(), id);
    }

    private MenuItem resolveMenuItem(Long menuItemId) {
        if (menuItemId == null) {
            return null;
        }
        return menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new BadRequestException("Dish " + menuItemId + " does not exist"));
    }

    private GalleryImage require(Long id) {
        return galleryRepository.findWithMenuItemById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Gallery image", id));
    }
}

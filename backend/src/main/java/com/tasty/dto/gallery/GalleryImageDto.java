package com.tasty.dto.gallery;

import com.tasty.dto.menu.MenuItemRefDto;
import com.tasty.entity.GalleryCategory;
import com.tasty.entity.GalleryGroup;

import java.time.Instant;

public record GalleryImageDto(
        Long id,
        String title,
        String titleFr,
        String description,
        String descriptionFr,
        String imageUrl,
        String storageKey,
        String altText,
        GalleryCategory category,
        GalleryGroup group,
        int displayOrder,
        boolean featured,
        MenuItemRefDto menuItem,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy) {
}

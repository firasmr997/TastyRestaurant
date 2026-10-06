package com.tasty.dto.menu;

import com.tasty.dto.category.CategorySummaryDto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Full dish, used by the detail page and the admin edit form. */
public record MenuItemDto(
        Long id,
        String slug,
        String name,
        String nameFr,
        String description,
        String descriptionFr,
        BigDecimal price,
        List<String> ingredients,
        List<String> ingredientsFr,
        CategorySummaryDto category,
        ImageDto mainImage,
        List<ImageDto> additionalImages,
        boolean available,
        boolean featured,
        boolean vegetarian,
        boolean spicy,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy) {
}

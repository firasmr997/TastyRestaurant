package com.tasty.dto.menu;

import com.tasty.dto.category.CategorySummaryDto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Dish as shown on menu cards and admin tables (no additional images). */
public record MenuItemSummaryDto(
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
        boolean available,
        boolean featured,
        boolean vegetarian,
        boolean spicy,
        Instant createdAt,
        Instant updatedAt) {
}

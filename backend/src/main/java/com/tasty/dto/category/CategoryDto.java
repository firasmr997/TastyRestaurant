package com.tasty.dto.category;

import java.time.Instant;

public record CategoryDto(
        Long id,
        String name,
        String nameFr,
        String slug,
        String description,
        String descriptionFr,
        int displayOrder,
        boolean active,
        long itemCount,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy) {
}

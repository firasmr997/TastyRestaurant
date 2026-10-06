package com.tasty.mapper;

import com.tasty.dto.category.CategoryDto;
import com.tasty.dto.category.CategoryRequest;
import com.tasty.dto.category.CategorySummaryDto;
import com.tasty.entity.Category;
import com.tasty.util.Text;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDto toDto(Category category, long itemCount) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getNameFr(),
                category.getSlug(),
                category.getDescription(),
                category.getDescriptionFr(),
                category.getDisplayOrder(),
                category.isActive(),
                itemCount,
                category.getCreatedAt(),
                category.getUpdatedAt(),
                category.getCreatedBy(),
                category.getUpdatedBy());
    }

    public CategorySummaryDto toSummary(Category category) {
        return new CategorySummaryDto(category.getId(), category.getName(), category.getNameFr(), category.getSlug());
    }

    /** Copies editable fields. The slug is handled by the service because it must stay unique. */
    public void apply(CategoryRequest request, Category category) {
        category.setName(request.name().trim());
        category.setNameFr(Text.clean(request.nameFr()));
        category.setDescription(Text.clean(request.description()));
        category.setDescriptionFr(Text.clean(request.descriptionFr()));
        category.setDisplayOrder(request.displayOrder());
        category.setActive(request.active());
    }
}

package com.tasty.mapper;

import com.tasty.dto.menu.ImageDto;
import com.tasty.dto.menu.MenuItemDto;
import com.tasty.dto.menu.MenuItemRefDto;
import com.tasty.dto.menu.MenuItemRequest;
import com.tasty.dto.menu.MenuItemSummaryDto;
import com.tasty.entity.MenuItem;
import com.tasty.entity.MenuItemImage;
import com.tasty.util.CsvList;
import com.tasty.util.Text;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MenuItemMapper {

    private final CategoryMapper categoryMapper;

    public MenuItemDto toDto(MenuItem item) {
        return new MenuItemDto(
                item.getId(),
                item.getSlug(),
                item.getName(),
                item.getNameFr(),
                item.getDescription(),
                item.getDescriptionFr(),
                item.getPrice(),
                CsvList.split(item.getIngredients()),
                CsvList.split(item.getIngredientsFr()),
                categoryMapper.toSummary(item.getCategory()),
                mainImage(item),
                item.getImages().stream().map(this::toImageDto).toList(),
                item.isAvailable(),
                item.isFeatured(),
                item.isVegetarian(),
                item.isSpicy(),
                item.getCreatedAt(),
                item.getUpdatedAt(),
                item.getCreatedBy(),
                item.getUpdatedBy());
    }

    public MenuItemSummaryDto toSummary(MenuItem item) {
        return new MenuItemSummaryDto(
                item.getId(),
                item.getSlug(),
                item.getName(),
                item.getNameFr(),
                item.getDescription(),
                item.getDescriptionFr(),
                item.getPrice(),
                CsvList.split(item.getIngredients()),
                CsvList.split(item.getIngredientsFr()),
                categoryMapper.toSummary(item.getCategory()),
                mainImage(item),
                item.isAvailable(),
                item.isFeatured(),
                item.isVegetarian(),
                item.isSpicy(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }

    public MenuItemRefDto toRef(MenuItem item) {
        return item == null ? null : new MenuItemRefDto(item.getId(), item.getSlug(), item.getName(), item.getNameFr());
    }

    /** Copies scalar fields. Category, slug and images are resolved by the service. */
    public void apply(MenuItemRequest request, MenuItem item) {
        item.setName(request.name().trim());
        item.setNameFr(Text.clean(request.nameFr()));
        item.setDescription(request.description().trim());
        item.setDescriptionFr(Text.clean(request.descriptionFr()));
        item.setPrice(request.price());
        item.setIngredients(CsvList.join(request.ingredients()));
        item.setIngredientsFr(CsvList.join(request.ingredientsFr()));
        item.setAvailable(request.available() == null || request.available());
        item.setFeatured(Boolean.TRUE.equals(request.featured()));
        item.setVegetarian(Boolean.TRUE.equals(request.vegetarian()));
        item.setSpicy(Boolean.TRUE.equals(request.spicy()));
    }

    private ImageDto mainImage(MenuItem item) {
        if (item.getMainImageUrl() == null) {
            return null;
        }
        return new ImageDto(null, item.getMainImageUrl(), item.getMainImageKey(), altOrName(item.getMainImageAlt(), item));
    }

    private ImageDto toImageDto(MenuItemImage image) {
        return new ImageDto(image.getId(), image.getImageUrl(), image.getStorageKey(),
                altOrName(image.getAltText(), image.getMenuItem()));
    }

    private static String altOrName(String alt, MenuItem item) {
        return alt != null && !alt.isBlank() ? alt : item.getName();
    }

    public static List<String> storageKeys(MenuItem item) {
        List<String> keys = new java.util.ArrayList<>();
        if (item.getMainImageKey() != null) {
            keys.add(item.getMainImageKey());
        }
        item.getImages().stream().map(MenuItemImage::getStorageKey).filter(java.util.Objects::nonNull).forEach(keys::add);
        return keys;
    }
}

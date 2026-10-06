package com.tasty.mapper;

import com.tasty.dto.gallery.GalleryImageDto;
import com.tasty.dto.gallery.GalleryImageRequest;
import com.tasty.entity.GalleryImage;
import com.tasty.util.Text;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GalleryImageMapper {

    private final MenuItemMapper menuItemMapper;

    public GalleryImageDto toDto(GalleryImage image) {
        return new GalleryImageDto(
                image.getId(),
                image.getTitle(),
                image.getTitleFr(),
                image.getDescription(),
                image.getDescriptionFr(),
                image.getImageUrl(),
                image.getStorageKey(),
                image.getAltText() != null ? image.getAltText() : image.getTitle(),
                image.getCategory(),
                image.getCategory().group(),
                image.getDisplayOrder(),
                image.isFeatured(),
                menuItemMapper.toRef(image.getMenuItem()),
                image.getCreatedAt(),
                image.getUpdatedAt(),
                image.getCreatedBy(),
                image.getUpdatedBy());
    }

    /** Copies editable fields. Image replacement and the dish link are handled by the service. */
    public void apply(GalleryImageRequest request, GalleryImage image) {
        image.setTitle(request.title().trim());
        image.setTitleFr(Text.clean(request.titleFr()));
        image.setDescription(Text.clean(request.description()));
        image.setDescriptionFr(Text.clean(request.descriptionFr()));
        image.setAltText(Text.clean(request.altText()));
        image.setCategory(request.category());
        image.setDisplayOrder(request.displayOrder());
        image.setFeatured(request.featured());
    }
}

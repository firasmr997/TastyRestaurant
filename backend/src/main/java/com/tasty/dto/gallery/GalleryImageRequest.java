package com.tasty.dto.gallery;

import com.tasty.entity.GalleryCategory;
import com.tasty.validation.ImageUrl;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GalleryImageRequest(
        @Schema(example = "Saturday night at the pass") @NotBlank @Size(max = 150) String title,
        @Schema(example = "Samedi soir au passe") @Size(max = 150) String titleFr,
        @Size(max = 600) String description,
        @Size(max = 600) String descriptionFr,
        @Schema(example = "/uploads/restaurant/9b1e2f.webp") @NotBlank @Size(max = 1000) @ImageUrl String imageUrl,
        @Schema(description = "Returned by the upload endpoint; omit for external URLs") @Size(max = 500) String storageKey,
        @Size(max = 255) String altText,
        @Schema(example = "KITCHEN") @NotNull GalleryCategory category,
        @Schema(example = "1") @NotNull @Min(0) @Max(9999) Integer displayOrder,
        @Schema(example = "false") @NotNull Boolean featured,
        @Schema(description = "Optional dish shown in the photo") Long menuItemId) {
}

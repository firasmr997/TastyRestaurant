package com.tasty.dto.menu;

import com.tasty.validation.ImageUrl;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Reference to an image: either uploaded through {@code POST /api/images} (with its storage key) or external. */
public record ImageRequest(
        @Schema(example = "/uploads/menu/3f2a9c.webp") @NotBlank @Size(max = 1000) @ImageUrl String url,
        @Schema(description = "Returned by the upload endpoint; omit for external URLs", example = "menu/3f2a9c.webp")
        @Size(max = 500) String storageKey,
        @Schema(example = "Double smash burger with melted cheddar") @Size(max = 255) String altText) {
}

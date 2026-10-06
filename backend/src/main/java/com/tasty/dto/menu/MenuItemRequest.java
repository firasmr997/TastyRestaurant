package com.tasty.dto.menu;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record MenuItemRequest(
        @Schema(example = "The Tasty Smash") @NotBlank @Size(max = 120) String name,
        @Schema(example = "Le Tasty Smash") @Size(max = 120) String nameFr,
        @Schema(description = "Optional; generated from the name when blank", example = "the-tasty-smash")
        @Size(max = 140) @Pattern(regexp = "^$|^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "must be lowercase words separated by hyphens")
        String slug,
        @NotBlank @Size(max = 1000) String description,
        @Size(max = 1000) String descriptionFr,
        @Schema(example = "14.50")
        @NotNull @DecimalMin("0.00") @DecimalMax("99999.99") @Digits(integer = 8, fraction = 2) BigDecimal price,
        @Schema(example = "1") @NotNull Long categoryId,
        @Size(max = 15)
        List<@NotBlank @Size(max = 60) @Pattern(regexp = "^[^,]+$", message = "must not contain commas") String> ingredients,
        @Size(max = 15)
        List<@NotBlank @Size(max = 60) @Pattern(regexp = "^[^,]+$", message = "must not contain commas") String> ingredientsFr,
        @Valid ImageRequest mainImage,
        @Size(max = 12) List<@Valid ImageRequest> additionalImages,
        Boolean available,
        Boolean featured,
        Boolean vegetarian,
        Boolean spicy) {
}

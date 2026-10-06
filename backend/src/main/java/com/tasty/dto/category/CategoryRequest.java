package com.tasty.dto.category;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @Schema(example = "Burgers") @NotBlank @Size(max = 80) String name,
        @Schema(example = "Burgers") @Size(max = 80) String nameFr,
        @Schema(description = "Optional; generated from the name when blank", example = "burgers")
        @Size(max = 100) @Pattern(regexp = "^$|^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "must be lowercase words separated by hyphens")
        String slug,
        @Size(max = 500) String description,
        @Size(max = 500) String descriptionFr,
        @Schema(example = "1") @NotNull @Min(0) @Max(9999) Integer displayOrder,
        @Schema(example = "true") @NotNull Boolean active) {
}

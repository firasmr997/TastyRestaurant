package com.tasty.dto.settings;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/** One day of the week. Times are "HH:mm"; a closing time before the opening time means after midnight. */
public record OpeningHoursDto(
        @Schema(description = "ISO day of week, 1 = Monday", example = "1") @NotNull @Min(1) @Max(7) Integer dayOfWeek,
        @Schema(example = "11:30") @Pattern(regexp = "^$|^([01]\\d|2[0-3]):[0-5]\\d$", message = "must be HH:mm") String opensAt,
        @Schema(example = "22:30") @Pattern(regexp = "^$|^([01]\\d|2[0-3]):[0-5]\\d$", message = "must be HH:mm") String closesAt,
        @Schema(example = "false") @NotNull Boolean closed) {
}

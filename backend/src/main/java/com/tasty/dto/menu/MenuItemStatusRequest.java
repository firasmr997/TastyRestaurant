package com.tasty.dto.menu;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;

/** Quick toggles from the admin table. Send only the fields to change. */
public record MenuItemStatusRequest(
        @Schema(example = "false") Boolean available,
        @Schema(example = "true") Boolean featured) {

    @JsonIgnore
    @Schema(hidden = true)
    @AssertTrue(message = "provide 'available' and/or 'featured'")
    public boolean isAnyFieldPresent() {
        return available != null || featured != null;
    }
}

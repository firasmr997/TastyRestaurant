package com.tasty.dto.message;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @Schema(example = "Lina Haddad") @NotBlank @Size(max = 120) String name,
        @Schema(example = "lina@example.com") @NotBlank @Email @Size(max = 255) String email,
        @Schema(example = "+1 555 0148")
        @Size(max = 40) @Pattern(regexp = "^$|^[+0-9 ().-]{6,40}$", message = "must be a valid phone number")
        String phone,
        @Schema(example = "Hi! Can we book the long table for 12 people next Friday?")
        @NotBlank @Size(min = 10, max = 4000) String message,
        @Schema(example = "en") @Pattern(regexp = "^$|^(en|fr)$", message = "must be 'en' or 'fr'") String locale,
        @Schema(description = "Honeypot field. Leave empty; humans never see it.", hidden = true)
        @Size(max = 200) String website) {
}

package com.tasty.dto.settings;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.math.BigDecimal;
import java.util.List;

public record SettingsRequest(
        @Schema(example = "Tasty") @NotBlank @Size(max = 80) String name,
        @Size(max = 200) String tagline,
        @Size(max = 200) String taglineFr,
        @Size(max = 1000) String description,
        @Size(max = 1000) String descriptionFr,
        @Size(max = 200) String addressLine,
        @Size(max = 100) String city,
        @Size(max = 20) String postalCode,
        @Size(max = 100) String country,
        @Size(max = 40) @Pattern(regexp = "^$|^[+0-9 ().-]{6,40}$", message = "must be a valid phone number") String phone,
        @Size(max = 255) @Email String email,
        @Size(max = 1000) @URL String mapUrl,
        @DecimalMin("-90") @DecimalMax("90") BigDecimal latitude,
        @DecimalMin("-180") @DecimalMax("180") BigDecimal longitude,
        @Size(max = 500) @URL String instagramUrl,
        @Size(max = 500) @URL String facebookUrl,
        @Size(max = 500) @URL String tiktokUrl,
        @Schema(example = "USD") @NotBlank @Pattern(regexp = "^[A-Z]{3}$", message = "must be an ISO 4217 code such as USD or EUR")
        String currencyCode,
        @Size(max = 200) String announcement,
        @Size(max = 200) String announcementFr,
        @NotNull Boolean promoEnabled,
        @Size(max = 120) String promoTitle,
        @Size(max = 120) String promoTitleFr,
        @Size(max = 500) String promoText,
        @Size(max = 500) String promoTextFr,
        Long promoMenuItemId,
        @NotNull @Size(min = 7, max = 7, message = "must list all seven days") List<@Valid @NotNull OpeningHoursDto> openingHours) {
}

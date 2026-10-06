package com.tasty.dto.settings;

import com.tasty.dto.menu.MenuItemSummaryDto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record SettingsDto(
        String name,
        String tagline,
        String taglineFr,
        String description,
        String descriptionFr,
        String addressLine,
        String city,
        String postalCode,
        String country,
        String phone,
        String email,
        String mapUrl,
        BigDecimal latitude,
        BigDecimal longitude,
        String instagramUrl,
        String facebookUrl,
        String tiktokUrl,
        String currencyCode,
        String announcement,
        String announcementFr,
        boolean promoEnabled,
        String promoTitle,
        String promoTitleFr,
        String promoText,
        String promoTextFr,
        MenuItemSummaryDto promoMenuItem,
        List<OpeningHoursDto> openingHours,
        Instant updatedAt,
        String updatedBy) {
}

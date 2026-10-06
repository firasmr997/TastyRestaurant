package com.tasty.mapper;

import com.tasty.dto.settings.OpeningHoursDto;
import com.tasty.dto.settings.SettingsDto;
import com.tasty.dto.settings.SettingsRequest;
import com.tasty.entity.OpeningHours;
import com.tasty.entity.RestaurantSettings;
import com.tasty.util.Text;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SettingsMapper {

    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private final MenuItemMapper menuItemMapper;

    public SettingsDto toDto(RestaurantSettings s, List<OpeningHours> hours) {
        return new SettingsDto(
                s.getName(),
                s.getTagline(),
                s.getTaglineFr(),
                s.getDescription(),
                s.getDescriptionFr(),
                s.getAddressLine(),
                s.getCity(),
                s.getPostalCode(),
                s.getCountry(),
                s.getPhone(),
                s.getEmail(),
                s.getMapUrl(),
                s.getLatitude(),
                s.getLongitude(),
                s.getInstagramUrl(),
                s.getFacebookUrl(),
                s.getTiktokUrl(),
                s.getCurrencyCode(),
                s.getAnnouncement(),
                s.getAnnouncementFr(),
                s.isPromoEnabled(),
                s.getPromoTitle(),
                s.getPromoTitleFr(),
                s.getPromoText(),
                s.getPromoTextFr(),
                s.getPromoMenuItem() == null ? null : menuItemMapper.toSummary(s.getPromoMenuItem()),
                hours.stream().map(this::toDto).toList(),
                s.getUpdatedAt(),
                s.getUpdatedBy());
    }

    public OpeningHoursDto toDto(OpeningHours h) {
        return new OpeningHoursDto((int) h.getDayOfWeek(), format(h.getOpensAt()), format(h.getClosesAt()), h.isClosed());
    }

    /** Copies scalar fields. The promotional dish and the hours are resolved by the service. */
    public void apply(SettingsRequest r, RestaurantSettings s) {
        s.setName(r.name().trim());
        s.setTagline(Text.clean(r.tagline()));
        s.setTaglineFr(Text.clean(r.taglineFr()));
        s.setDescription(Text.clean(r.description()));
        s.setDescriptionFr(Text.clean(r.descriptionFr()));
        s.setAddressLine(Text.clean(r.addressLine()));
        s.setCity(Text.clean(r.city()));
        s.setPostalCode(Text.clean(r.postalCode()));
        s.setCountry(Text.clean(r.country()));
        s.setPhone(Text.clean(r.phone()));
        s.setEmail(Text.clean(r.email()));
        s.setMapUrl(Text.clean(r.mapUrl()));
        s.setLatitude(r.latitude());
        s.setLongitude(r.longitude());
        s.setInstagramUrl(Text.clean(r.instagramUrl()));
        s.setFacebookUrl(Text.clean(r.facebookUrl()));
        s.setTiktokUrl(Text.clean(r.tiktokUrl()));
        s.setCurrencyCode(r.currencyCode());
        s.setAnnouncement(Text.clean(r.announcement()));
        s.setAnnouncementFr(Text.clean(r.announcementFr()));
        s.setPromoEnabled(r.promoEnabled());
        s.setPromoTitle(Text.clean(r.promoTitle()));
        s.setPromoTitleFr(Text.clean(r.promoTitleFr()));
        s.setPromoText(Text.clean(r.promoText()));
        s.setPromoTextFr(Text.clean(r.promoTextFr()));
    }

    public static LocalTime parse(String value) {
        String cleaned = Text.clean(value);
        return cleaned == null ? null : LocalTime.parse(cleaned, HH_MM);
    }

    private static String format(LocalTime time) {
        return time == null ? null : time.format(HH_MM);
    }
}

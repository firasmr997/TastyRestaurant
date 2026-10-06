package com.tasty.service;

import com.tasty.dto.settings.OpeningHoursDto;
import com.tasty.dto.settings.SettingsDto;
import com.tasty.dto.settings.SettingsRequest;
import com.tasty.entity.OpeningHours;
import com.tasty.entity.RestaurantSettings;
import com.tasty.exception.BadRequestException;
import com.tasty.mapper.SettingsMapper;
import com.tasty.repository.MenuItemRepository;
import com.tasty.repository.OpeningHoursRepository;
import com.tasty.repository.RestaurantSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final RestaurantSettingsRepository settingsRepository;
    private final OpeningHoursRepository hoursRepository;
    private final MenuItemRepository menuItemRepository;
    private final SettingsMapper settingsMapper;

    @Transactional(readOnly = true)
    public SettingsDto get() {
        return settingsMapper.toDto(load(), hoursRepository.findAllByOrderByDayOfWeekAsc());
    }

    @Transactional
    public SettingsDto update(SettingsRequest request) {
        RestaurantSettings settings = load();
        settingsMapper.apply(request, settings);
        settings.setPromoMenuItem(request.promoMenuItemId() == null ? null
                : menuItemRepository.findById(request.promoMenuItemId())
                .orElseThrow(() -> new BadRequestException("Dish " + request.promoMenuItemId() + " does not exist")));
        updateHours(request.openingHours());
        return settingsMapper.toDto(settings, hoursRepository.findAllByOrderByDayOfWeekAsc());
    }

    private void updateHours(List<OpeningHoursDto> requested) {
        Set<Integer> days = new HashSet<>();
        for (OpeningHoursDto day : requested) {
            if (!days.add(day.dayOfWeek())) {
                throw new BadRequestException("Opening hours list day " + day.dayOfWeek() + " twice");
            }
            if (!day.closed() && (isBlank(day.opensAt()) || isBlank(day.closesAt()))) {
                throw new BadRequestException("Set opening and closing times for every open day");
            }
        }
        Map<Short, OpeningHours> existing = hoursRepository.findAll().stream()
                .collect(Collectors.toMap(OpeningHours::getDayOfWeek, Function.identity()));
        for (OpeningHoursDto day : requested) {
            OpeningHours hours = existing.computeIfAbsent(day.dayOfWeek().shortValue(), d -> {
                OpeningHours created = new OpeningHours();
                created.setDayOfWeek(d);
                return created;
            });
            // Closed days keep their last times so re-opening a day restores them.
            hours.setClosed(day.closed());
            LocalTime opens = SettingsMapper.parse(day.opensAt());
            LocalTime closes = SettingsMapper.parse(day.closesAt());
            if (opens != null || !day.closed()) {
                hours.setOpensAt(opens);
            }
            if (closes != null || !day.closed()) {
                hours.setClosesAt(closes);
            }
            hoursRepository.save(hours);
        }
    }

    private RestaurantSettings load() {
        return settingsRepository.findWithPromoById(RestaurantSettings.SINGLETON_ID)
                .orElseThrow(() -> new IllegalStateException("restaurant_settings row is missing; run the Flyway migrations"));
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}

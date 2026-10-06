package com.tasty.service;

import com.tasty.dto.dashboard.DashboardDto;
import com.tasty.entity.Category;
import com.tasty.entity.GalleryCategory;
import com.tasty.entity.GalleryGroup;
import com.tasty.entity.MessageStatus;
import com.tasty.mapper.ContactMessageMapper;
import com.tasty.mapper.MenuItemMapper;
import com.tasty.repository.CategoryRepository;
import com.tasty.repository.ContactMessageRepository;
import com.tasty.repository.GalleryImageRepository;
import com.tasty.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    /** Days shown in the "messages received" chart. */
    static final int CHART_DAYS = 14;

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final GalleryImageRepository galleryRepository;
    private final ContactMessageRepository messageRepository;
    private final MenuItemMapper menuItemMapper;
    private final ContactMessageMapper messageMapper;
    private final Clock clock = Clock.systemUTC();

    @Transactional(readOnly = true)
    public DashboardDto overview() {
        long foodImages = galleryRepository.countByCategoryIn(GalleryCategory.inGroup(GalleryGroup.FOOD));
        long restaurantImages = galleryRepository.countByCategoryIn(GalleryCategory.inGroup(GalleryGroup.RESTAURANT));

        var stats = new DashboardDto.Stats(
                menuItemRepository.count(),
                menuItemRepository.countByAvailableTrue(),
                menuItemRepository.countByFeaturedTrue(),
                categoryRepository.count(),
                categoryRepository.countByActiveTrue(),
                foodImages + restaurantImages,
                foodImages,
                restaurantImages,
                messageRepository.countByStatus(MessageStatus.NEW),
                messageRepository.count());

        return new DashboardDto(
                stats,
                itemsPerCategory(),
                messagesPerDay(),
                menuItemRepository.findTop5ByOrderByCreatedAtDesc().stream().map(menuItemMapper::toSummary).toList(),
                messageRepository.findTop5ByStatusNotOrderByCreatedAtDesc(MessageStatus.ARCHIVED).stream()
                        .map(messageMapper::toDto).toList());
    }

    private List<DashboardDto.CategoryStat> itemsPerCategory() {
        Map<Long, Long> counts = menuItemRepository.countPerCategory().stream()
                .collect(Collectors.toMap(MenuItemRepository.CategoryCount::getCategoryId,
                        MenuItemRepository.CategoryCount::getTotal));
        List<Category> categories = categoryRepository.findAll(
                Sort.by(Sort.Order.asc("displayOrder"), Sort.Order.asc("name")));
        return categories.stream()
                .map(c -> new DashboardDto.CategoryStat(c.getId(), c.getName(), counts.getOrDefault(c.getId(), 0L)))
                .toList();
    }

    /** One entry per day for the last {@link #CHART_DAYS} days, zero-filled. */
    private List<DashboardDto.DailyStat> messagesPerDay() {
        LocalDate today = LocalDate.now(clock);
        LocalDate first = today.minusDays(CHART_DAYS - 1L);
        Map<LocalDate, Long> counts = messageRepository
                .countPerDaySince(first.atStartOfDay().toInstant(ZoneOffset.UTC)).stream()
                .collect(Collectors.toMap(ContactMessageRepository.DailyCount::getDay,
                        ContactMessageRepository.DailyCount::getTotal));
        List<DashboardDto.DailyStat> days = new ArrayList<>(CHART_DAYS);
        for (LocalDate day = first; !day.isAfter(today); day = day.plusDays(1)) {
            days.add(new DashboardDto.DailyStat(day, counts.getOrDefault(day, 0L)));
        }
        return days;
    }
}

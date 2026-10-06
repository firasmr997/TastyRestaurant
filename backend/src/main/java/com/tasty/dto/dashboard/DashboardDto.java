package com.tasty.dto.dashboard;

import com.tasty.dto.menu.MenuItemSummaryDto;
import com.tasty.dto.message.ContactMessageDto;

import java.time.LocalDate;
import java.util.List;

public record DashboardDto(
        Stats stats,
        List<CategoryStat> itemsPerCategory,
        List<DailyStat> messagesPerDay,
        List<MenuItemSummaryDto> recentItems,
        List<ContactMessageDto> recentMessages) {

    public record Stats(
            long totalItems,
            long availableItems,
            long featuredItems,
            long categories,
            long activeCategories,
            long galleryImages,
            long foodImages,
            long restaurantImages,
            long unreadMessages,
            long totalMessages) {
    }

    public record CategoryStat(Long categoryId, String name, long count) {
    }

    public record DailyStat(LocalDate date, long count) {
    }
}

package com.tasty.dto.message;

import com.tasty.entity.MessageStatus;

import java.time.Instant;

public record ContactMessageDto(
        Long id,
        String name,
        String email,
        String phone,
        String message,
        MessageStatus status,
        String locale,
        Instant readAt,
        Instant createdAt,
        Instant updatedAt) {
}

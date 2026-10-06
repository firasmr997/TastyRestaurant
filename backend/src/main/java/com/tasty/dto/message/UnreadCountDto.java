package com.tasty.dto.message;

import java.util.List;

/** Unread message count plus the newest unread messages, for the admin notification bell. */
public record UnreadCountDto(long unread, List<ContactMessageDto> latest) {
}

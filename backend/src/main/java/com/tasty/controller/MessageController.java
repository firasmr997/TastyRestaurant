package com.tasty.controller;

import com.tasty.config.OpenApiConfig;
import com.tasty.dto.common.ApiResponse;
import com.tasty.dto.common.PageResponse;
import com.tasty.dto.message.ContactMessageDto;
import com.tasty.dto.message.UnreadCountDto;
import com.tasty.entity.MessageStatus;
import com.tasty.service.MessageService;
import com.tasty.util.Paging;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Messages")
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class MessageController {

    private final MessageService messageService;

    @Operation(summary = "List contact messages",
            description = "Newest first. Without `status` the inbox shows NEW and READ messages; use ARCHIVED to see the archive.")
    @GetMapping
    public ApiResponse<PageResponse<ContactMessageDto>> list(
            @Parameter(description = "NEW, READ or ARCHIVED") @RequestParam(required = false) MessageStatus status,
            @Parameter(description = "Search name, email, phone and message") @RequestParam(required = false) String q,
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (1-100)") @RequestParam(defaultValue = "20") int size) {
        Paging.check(page, size);
        return ApiResponse.ok(messageService.list(status, q, page, size));
    }

    @Operation(summary = "Unread count and latest unread messages (notification bell)")
    @GetMapping("/unread")
    public ApiResponse<UnreadCountDto> unread() {
        return ApiResponse.ok(messageService.unread());
    }

    @Operation(summary = "Get a message")
    @GetMapping("/{id}")
    public ApiResponse<ContactMessageDto> get(@PathVariable Long id) {
        return ApiResponse.ok(messageService.get(id));
    }

    @Operation(summary = "Mark as read")
    @PutMapping("/{id}/read")
    public ApiResponse<ContactMessageDto> markRead(@PathVariable Long id) {
        return ApiResponse.ok(messageService.markRead(id), "Marked as read");
    }

    @Operation(summary = "Mark as unread")
    @PutMapping("/{id}/unread")
    public ApiResponse<ContactMessageDto> markUnread(@PathVariable Long id) {
        return ApiResponse.ok(messageService.markUnread(id), "Marked as unread");
    }

    @Operation(summary = "Archive")
    @PutMapping("/{id}/archive")
    public ApiResponse<ContactMessageDto> archive(@PathVariable Long id) {
        return ApiResponse.ok(messageService.archive(id), "Message archived");
    }

    @Operation(summary = "Delete permanently")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        messageService.delete(id);
        return ApiResponse.message("Message deleted");
    }
}

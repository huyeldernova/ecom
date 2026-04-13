package com.example.notificationservice.controller;

import com.example.notificationservice.dto.ApiResponses;
import com.example.notificationservice.dto.PageResponse;
import com.example.notificationservice.entity.Notification;
import com.example.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    private UUID extractUserId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    // ─── Lấy danh sách notification ────────────────────────────────
    @GetMapping
    public ApiResponses<PageResponse<Notification>> getNotifications(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        UUID userId = extractUserId(jwt);

        return ApiResponses.<PageResponse<Notification>>builder()
                .code(200)
                .message("Notifications retrieved successfully")
                .data(notificationService.getNotifications(userId, page, size))
                .build();
    }

    // ─── Đếm số chưa đọc (badge) ───────────────────────────────────
    @GetMapping("/unread-count")
    public ApiResponses<Long> getUnreadCount(@AuthenticationPrincipal Jwt jwt) {

        UUID userId = extractUserId(jwt);

        return ApiResponses.<Long>builder()
                .code(200)
                .message("Success")
                .data(notificationService.getUnreadCount(userId))
                .build();
    }

    // ─── Đánh dấu đã đọc ───────────────────────────────────────────
    @PutMapping("/{id}/read")
    public ApiResponses<Void> markAsRead(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {

        UUID userId = extractUserId(jwt);
        notificationService.markAsRead(id, userId);

        return ApiResponses.<Void>builder()
                .code(200)
                .message("Marked as read successfully")
                .build();
    }

}
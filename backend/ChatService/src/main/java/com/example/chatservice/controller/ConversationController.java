package com.example.chatservice.controller;

import com.example.chatservice.dto.request.ConversationCreationRequest;
import com.example.chatservice.dto.response.*;
import com.example.chatservice.service.ChatService;
import com.example.chatservice.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/conversations")
public class ConversationController {

    private final ConversationService conversationService;
    private final ChatService chatService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ApiResponses<ConversationCreationResponse> createConversation(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody @Valid ConversationCreationRequest request) {

        String userId = jwt.getSubject();
        String username = jwt.getClaimAsString("email");

        var result = conversationService.createConversation(userId, username, request);
        return ApiResponses.<ConversationCreationResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Conversation created successfully")
                .data(result)
                .build();
    }

    @GetMapping("/my-conversation")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ApiResponses<PageResponse<ConversationDetailResponse>> myConversation(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "")   String conversationType) {

        String userId = jwt.getSubject();
        var result = conversationService.myConversation(userId, page, size, conversationType);
        return ApiResponses.<PageResponse<ConversationDetailResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Conversation list retrieved successfully")
                .data(result)
                .build();
    }

    @GetMapping("/{conversationId}/messages")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ApiResponses<PageResponse<ChatMessageResponse>> getMessages(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "20") int size) {

        String userId = jwt.getSubject();
        var result = chatService.getMessagesByConversationId(userId, conversationId, page, size);
        return ApiResponses.<PageResponse<ChatMessageResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Messages retrieved successfully")
                .data(result)
                .build();
    }

    // User bấm "Chat với hỗ trợ"
    @PostMapping("/support")
    @PreAuthorize("hasAuthority('USER')")
    public ApiResponses<ConversationCreationResponse> createSupportConversation(
            @AuthenticationPrincipal Jwt jwt) {

        String userId   = jwt.getSubject();
        String username = jwt.getClaimAsString("email"); // JWT lưu email, không có username

        var result = conversationService.createSupportConversation(userId, username);
        return ApiResponses.<ConversationCreationResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Support conversation created successfully")
                .data(result)
                .build();
    }

    // Admin xem tất cả ticket đang chờ
    @GetMapping("/admin/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponses<List<ConversationDetailResponse>> getPendingConversations() {

        var result = conversationService.getPendingSupport();
        return ApiResponses.<List<ConversationDetailResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Pending conversations retrieved successfully")
                .data(result)
                .build();
    }
}
package com.example.chatservice.service;

import com.example.chatservice.client.FileServiceClient;
import com.example.chatservice.common.MessageType;
import com.example.chatservice.dto.client.LinkFilesRequest;
import com.example.chatservice.dto.request.ChatMessageRequest;
import com.example.chatservice.dto.response.ChatMessageResponse;
import com.example.chatservice.dto.response.PageResponse;
import com.example.chatservice.entity.ChatMessage;
import com.example.chatservice.entity.Conversation;
import com.example.chatservice.exception.AppException;
import com.example.chatservice.exception.ErrorCode;
import com.example.chatservice.repository.ChatMessageRepository;
import com.example.chatservice.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CHAT-SERVICE")
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ConversationRepository conversationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FileServiceClient fileServiceClient;

    @Transactional
    public ChatMessageResponse sendChatMessage(String senderId, String senderUsername, ChatMessageRequest request) {

        // 1. Tìm conversation
        Conversation conversation = conversationRepository
                .findById(UUID.fromString(String.valueOf(request.getConversationId())))
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // 2. Kiểm tra sender có trong conversation không
        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(UUID.fromString(senderId)));
        if (!isParticipant) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        // 3. Tạo message
        ChatMessage chatMessage = ChatMessage.builder()
                .conversation(conversation)
                .senderId(UUID.fromString(senderId))
                .senderUsername(senderUsername)
                .content(request.getMessage() != null && !request.getMessage().isBlank()
                        ? request.getMessage()
                        : "[File]")
                .messageType(request.getMessageType() != null
                        ? request.getMessageType()
                        : MessageType.TEXT)
                .fileIds(request.getFileIds() != null
                        ? request.getFileIds()
                        : new ArrayList<>())
                .build();

        chatMessageRepository.save(chatMessage);

        // 4. Link files vào message nếu có
        if (request.getFileIds() != null && !request.getFileIds().isEmpty()) {
            try {
                fileServiceClient.linkFiles(
                        LinkFilesRequest.builder()
                                .fileIds(request.getFileIds())
                                .targetId(chatMessage.getId())
                                .targetType("CHAT_MESSAGE")
                                .requesterId(UUID.fromString(senderId))
                                .build()
                );
                log.info("Linked {} files to message {}",
                        request.getFileIds().size(), chatMessage.getId());
            } catch (Exception e) {
                // Không throw — tin nhắn vẫn được gửi dù link file thất bại
                log.warn("Failed to link files to message {}: {}",
                        chatMessage.getId(), e.getMessage());
            }
        }

        // 5. Cập nhật lastMessage trên conversation
        conversation.setLastMessageContent(chatMessage.getContent());
        conversation.setLastMessageTime(chatMessage.getSentAt());
        conversationRepository.save(conversation);

        log.info("Message saved by {} to conversation {}", senderId, request.getConversationId());

        // 6. Lấy danh sách participantIds để gửi realtime
        List<String> recipientIds = conversation.getParticipants().stream()
                .map(p -> p.getUserId().toString())
                .toList();

        // 7. Build response
        ChatMessageResponse response = ChatMessageResponse.builder()
                .id(chatMessage.getId().toString())
                .tempId(request.getTempId())
                .conversationId(conversation.getId().toString())
                .conversationAvatar(conversation.getConversationAvatar())
                .username(senderUsername)
                .conversationType(conversation.getConversationType() != null
                        ? conversation.getConversationType().name()
                        : null)
                .message(chatMessage.getContent())
                .fileIds(chatMessage.getFileIds())
                .messageType(chatMessage.getMessageType())
                .participants(recipientIds)
                .createdAt(chatMessage.getSentAt())
                .conversationCreatedBy(senderId)
                .build();

        // 8. Gửi realtime tới từng participant
        recipientIds.forEach(uid -> {
            try {
                messagingTemplate.convertAndSendToUser(
                        uid,
                        "/queue/chat",
                        response.toBuilder()
                                .me(uid.equals(senderId))
                                .build()
                );
            } catch (MessagingException e) {
                log.warn("Failed to send realtime to user {}: {}", uid, e.getMessage());
            }
        });

        return response;
    }

    @Transactional(readOnly = true)
    public PageResponse<ChatMessageResponse> getMessagesByConversationId(
            String userId, String conversationId, int page, int size) {

        // 1. Tìm conversation
        Conversation conversation = conversationRepository
                .findById(UUID.fromString(conversationId))
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // 2. Kiểm tra user có trong conversation không
        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(UUID.fromString(userId)));
        if (!isParticipant) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        // 3. Query phân trang — mới nhất trước
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<ChatMessage> chatMessagePage = chatMessageRepository
                .findByConversationIdOrderBySentAtDesc(conversation.getId(), pageable);

        // 4. Reverse → hiển thị cũ đến mới
        List<ChatMessage> chatMessages = new ArrayList<>(chatMessagePage.getContent());
        Collections.reverse(chatMessages);

        // 5. Map sang response
        return PageResponse.<ChatMessageResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(chatMessagePage.getTotalPages())
                .totalElements(chatMessagePage.getTotalElements())
                .data(chatMessages.stream()
                        .map(msg -> ChatMessageResponse.builder()
                                .id(msg.getId().toString())
                                .conversationId(conversation.getId().toString())
                                .me(msg.getSenderId().equals(UUID.fromString(userId))) // ✅ fix UUID.equals(UUID)
                                .username(msg.getSenderUsername())
                                .message(msg.getContent())
                                .messageType(msg.getMessageType())
                                .fileIds(msg.getFileIds())
                                .createdAt(msg.getSentAt())
                                .build())
                        .toList())
                .build();
    }
}
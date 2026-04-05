package com.example.chatservice.service;


import com.example.chatservice.dto.request.ConversationCreationRequest;
import com.example.chatservice.dto.response.*;
import com.example.chatservice.entity.Conversation;
import com.example.chatservice.entity.ConversationParticipant;
import com.example.chatservice.entity.ConversationStatus;
import com.example.chatservice.entity.ConversationType;
import com.example.chatservice.exception.AppException;
import com.example.chatservice.exception.ErrorCode;
import com.example.chatservice.repository.ConversationParticipantRepository;
import com.example.chatservice.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CONVERSATION-SERVICE")
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final AdminRoutingService adminRoutingService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationParticipantRepository conversationParticipantRepository;

    public ConversationCreationResponse createConversation(String requesterId, String requesterUsername, ConversationCreationRequest request) {

        // Đảm bảo requester có trong danh sách participants
        Map<String, String> participants = request.getParticipants();
        participants.putIfAbsent(requesterId, requesterUsername);

        String participantHash = null;

        if (request.getConversationType() == ConversationType.PRIVATE) {
            if (participants.size() > 2) {
                throw new AppException(ErrorCode.PRIVATE_CONVERSATION_MAX_TWO_PARTICIPANTS);
            }

            participantHash = participants.keySet().stream()
                    .sorted()
                    .collect(Collectors.joining("-"));

            Optional<Conversation> existing = conversationRepository.findByParticipantHash(participantHash);
            if (existing.isPresent()) {
                log.info("Conversation existed");
                return toCreationResponse(existing.get(), requesterId);
            }
        }

        if (request.getConversationType() == ConversationType.GROUP) {
            if (request.getConversationName() == null || request.getConversationName().trim().isEmpty()) {
                throw new AppException(ErrorCode.CONVERSATION_NAME_REQUIRED);
            }
            if (participants.size() < 3) {
                throw new AppException(ErrorCode.GROUP_CONVERSATION_MINIMUM_THREE_PARTICIPANTS);
            }
        }

        Conversation conversation = Conversation.builder()
                .name(request.getConversationName())
                .conversationType(request.getConversationType())
                .conversationAvatar(request.getConversationAvatar())
                .participantHash(participantHash)
                .createdAt(LocalDateTime.now())
                .build();

        List<ConversationParticipant> conversationParticipants = participants.entrySet().stream()
                .map(entry -> ConversationParticipant.builder()
                        .conversation(conversation)
                        .userId(UUID.fromString(entry.getKey()))
                        .username(entry.getValue())
                        .build())
                .toList();

        conversation.setParticipants(conversationParticipants);
        conversationRepository.save(conversation);

        return toCreationResponse(conversation, requesterId);
    }

    public PageResponse<ConversationDetailResponse> myConversation(String userId, int page, int size, String conversationType) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("lastMessageTime").descending());

        Page<Conversation> conversationsPage;
        if (conversationType == null || conversationType.trim().isEmpty()) {
            conversationsPage = conversationRepository.findByParticipantsUserId(UUID.fromString(String.valueOf(UUID.fromString(userId))), pageable);
        } else {
            ConversationType type = ConversationType.valueOf(conversationType);
            conversationsPage = conversationRepository.findByConversationTypeAndParticipantsUserId(type, UUID.fromString(String.valueOf(UUID.fromString(userId))), pageable);
        }

        List<ConversationDetailResponse> data = conversationsPage.getContent().stream()
                .map(conv -> {
                    List<ParticipantInfo> participantInfos = conv.getParticipants().stream()
                            .map(p -> ParticipantInfo.builder()
                                    .userId(p.getUserId())
                                    .username(p.getUsername())
                                    .me(p.getUserId().equals(UUID.fromString(userId)))
                                    .build())
                            .toList();

                    String displayName;
                    if (conv.getConversationType() == ConversationType.GROUP) {
                        displayName = conv.getName();
                    } else {
                        displayName = conv.getParticipants().stream()
                                .filter(p -> !p.getUserId().equals(UUID.fromString(userId)))
                                .findFirst()
                                .map(p -> p.getUsername() != null ? p.getUsername() : p.getUserId().toString())
                                .orElse(null);
                    }

                    return ConversationDetailResponse.builder()
                            .id(conv.getId())
                            .conversationType(conv.getConversationType())
                            .conversationName(displayName)
                            .conversationAvatar(conv.getConversationAvatar())
                            .participants(participantInfos)
                            .lastMessageContent(conv.getLastMessageContent())
                            .lastMessageTime(conv.getLastMessageTime())
                            .lastActivityTime(conv.getLastMessageTime() != null
                                    ? conv.getLastMessageTime()
                                    : conv.getCreatedAt())
                            .build();
                }).toList();

        return PageResponse.<ConversationDetailResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(conversationsPage.getTotalPages())
                .totalElements(conversationsPage.getTotalElements())
                .data(data)
                .build();
    }

    public ConversationCreationResponse createSupportConversation(String userId, String username) {

        // 1. Kiểm tra đã có conversation support chưa (PENDING hoặc ACTIVE)
        Optional<Conversation> existing = conversationRepository.findActiveSupportConversation(
                UUID.fromString(userId),
                ConversationType.SUPPORT,
                ConversationStatus.CLOSED    // exclude CLOSED → giữ lại PENDING + ACTIVE
        );

        if (existing.isPresent()) {
            log.info("User {} already has an active support conversation", userId);
            return toCreationResponse(existing.get(), userId);
        }

        // 2. Tìm admin phù hợp nhất
        Optional<String> bestAdminId = adminRoutingService.findBestAdmin();

        // 3. Build conversation
        Conversation conversation = Conversation.builder()
                .name("Hỗ trợ khách hàng")
                .conversationType(ConversationType.SUPPORT)
                .createdAt(LocalDateTime.now())
                .build();
        // status mặc định là PENDING (đã set @Builder.Default trong entity)

        // 4. Tạo participant cho user
        List<ConversationParticipant> participantList = new ArrayList<>();
        participantList.add(ConversationParticipant.builder()
                .conversation(conversation)
                .userId(UUID.fromString(userId))
                .username(username)
                .build());

        if (bestAdminId.isPresent()) {
            // 5a. Có admin online → thêm admin vào, set ACTIVE
            String adminId = bestAdminId.get();

            participantList.add(ConversationParticipant.builder()
                    .conversation(conversation)
                    .userId(UUID.fromString(adminId))
                    .username("Support Team")
                    .build());

            conversation.setParticipants(participantList);
            conversation.setStatus(ConversationStatus.ACTIVE);
            conversationRepository.save(conversation);

            // 6. Tăng counter của admin
            adminRoutingService.incrementActiveChat(adminId);

            // 7. Notify admin qua STOMP
            messagingTemplate.convertAndSendToUser(
                    adminId,
                    "/queue/assigned",
                    toCreationResponse(conversation, userId)
            );

            log.info("Support conversation created — assigned to admin {}", adminId);

        } else {
            // 5b. Không có admin → lưu PENDING, chờ admin login
            conversation.setParticipants(participantList);
            conversationRepository.save(conversation);

            log.info("Support conversation created — status PENDING, no admin online");
        }

        return toCreationResponse(conversation, userId);
    }

    @Transactional
    public void markAsRead(String userId, String conversationId){
        ConversationParticipant participant = conversationParticipantRepository.findByUserIdAndConversationId(UUID.fromString(userId), UUID.fromString(conversationId))
                .orElseThrow(() -> new AppException(ErrorCode.PARTICIPANT_NOT_FOUND));

        participant.setLastReadAt(LocalDateTime.now());
        conversationParticipantRepository.save(participant);

        ReadReceiptResponse response = ReadReceiptResponse.builder()
                .userId(userId)
                .conversationId(UUID.fromString(conversationId))
                .lastReadAt(participant.getLastReadAt())
                .build();

        List<String> recipientIds = participant.getConversation().getParticipants()
                .stream()
                .filter(p -> !p.getUserId().equals(UUID.fromString(userId)))
                .map(p -> p.getUserId().toString())
                .toList();

        for (String recipientId : recipientIds) {
            messagingTemplate.convertAndSendToUser(
                    recipientId,
                    "/queue/read-receipt",
                    response
            );
        }

        log.info("User {} marked conversation {} as read", userId, conversationId);
    }

    public List<ConversationDetailResponse> getPendingSupport() {
        List<Conversation> pendingList = conversationRepository
                .findByConversationTypeAndStatus(
                        ConversationType.SUPPORT,
                        ConversationStatus.PENDING
                );

        return pendingList.stream()
                .map(conv -> ConversationDetailResponse.builder()
                        .id(conv.getId())
                        .conversationType(conv.getConversationType())
                        .conversationName(conv.getName())
                        .participants(conv.getParticipants().stream()
                                .map(p -> ParticipantInfo.builder()
                                        .userId(p.getUserId())
                                        .username(p.getUsername())
                                        .me(false)
                                        .build())
                                .toList())
                        .lastMessageContent(conv.getLastMessageContent())
                        .lastMessageTime(conv.getLastMessageTime())
                        .lastActivityTime(conv.getCreatedAt())
                        .build())
                .toList();
    }

    private ConversationCreationResponse toCreationResponse(Conversation conversation, String requesterId) {
        List<ParticipantInfo> participantInfos = conversation.getParticipants().stream()
                .map(p -> ParticipantInfo.builder()
                        .userId(p.getUserId())
                        .username(p.getUsername())
                        .me(p.getUserId().equals(UUID.fromString(requesterId)))
                        .build())
                .toList();

        String displayName;
        if (conversation.getConversationType() == ConversationType.GROUP) {
            displayName = conversation.getName();
        } else {
            displayName = conversation.getParticipants().stream()
                    .filter(p -> !p.getUserId().equals(UUID.fromString(requesterId)))
                    .findFirst()
                    .map(p -> p.getUsername() != null ? p.getUsername() : p.getUserId().toString())
                    .orElse(null);
        }

        return ConversationCreationResponse.builder()
                .id(conversation.getId())
                .conversationType(conversation.getConversationType())
                .participantHash(conversation.getParticipantHash())
                .conversationName(displayName)
                .conversationAvatar(conversation.getConversationAvatar())
                .participantInfo(participantInfos)
                .createdAt(conversation.getCreatedAt())
                .conversationCreatedBy(requesterId)
                .build();
    }

}
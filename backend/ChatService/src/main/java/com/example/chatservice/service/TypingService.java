package com.example.chatservice.service;

import com.example.chatservice.dto.request.TypingRequest;
import com.example.chatservice.dto.response.TypingResponse;
import com.example.chatservice.entity.ConversationParticipant;
import com.example.chatservice.exception.AppException;
import com.example.chatservice.exception.ErrorCode;
import com.example.chatservice.repository.ConversationParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TypingService {

    private final ConversationParticipantRepository conversationParticipantRepository;
    private final StringRedisTemplate redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void handleTyping(String userId, TypingRequest request){


        // 1. Tìm participant để lấy conversation
        ConversationParticipant participant = conversationParticipantRepository
                .findByUserIdAndConversationId(
                        UUID.fromString(userId),
                        UUID.fromString(request.getConversationId())
                )
                .orElseThrow(() -> new AppException(ErrorCode.PARTICIPANT_NOT_FOUND));

        // 2. Lấy danh sách người nhận (bỏ chính mình)
        List<String> recipientIds = participant.getConversation().getParticipants()
                .stream()
                .filter(p -> !p.getUserId().equals(UUID.fromString(userId)))
                .map(p -> p.getUserId().toString())
                .toList();

        // 3. Redis key
        String redisKey = "typing:" + request.getConversationId() + ":" + userId;

        // 4. Xử lý theo typing true/false
        if (request.isTyping()) {
            //  SET Redis key với TTL 3 giây

            redisTemplate.opsForValue().set(redisKey,"1",  3, TimeUnit.SECONDS);

        } else {
            // DEL Redis key
           redisTemplate.delete(redisKey);
        }

        // 5. Build response
        TypingResponse response = TypingResponse.builder()
                .userId(userId)
                .conversationId(request.getConversationId())
                .typing(request.isTyping())
                .build();

        for (String recipientId : recipientIds) {
            messagingTemplate.convertAndSendToUser(
                    recipientId,
                    "/queue/typing",
                    response

            );
        }

        log.info("User {} typing={} in conversation {}",
                userId, request.isTyping(), request.getConversationId());

    }

}

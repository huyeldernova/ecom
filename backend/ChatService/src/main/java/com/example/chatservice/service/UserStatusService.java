package com.example.chatservice.service;

import com.example.chatservice.dto.response.OnlineStatusResponse;
import com.example.chatservice.dto.response.ReadReceiptResponse;
import com.example.chatservice.entity.ConversationParticipant;
import com.example.chatservice.entity.SocketSession;
import com.example.chatservice.exception.AppException;
import com.example.chatservice.exception.ErrorCode;
import com.example.chatservice.repository.ConversationParticipantRepository;
import com.example.chatservice.repository.SocketSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserStatusService {

    private final SocketSessionRepository socketSessionRepository;
    private final RedisTemplate<String, String> redisTemplate;

    public OnlineStatusResponse getOnlineStatus(String userId){
        List<SocketSession> sessions = socketSessionRepository.findByUserId(userId);
        boolean online = !sessions.isEmpty();

        LocalDateTime lastSeenAt = null;
        if (!online) {
            try {
                String value = redisTemplate.opsForValue().get("last_seen:" + userId);
                if (value != null) {
                    lastSeenAt = LocalDateTime.parse(value);
                }
            } catch (Exception e) {
                log.warn("Redis unavailable, lastSeenAt will be null for userId: {}", userId);
            }
        }

        return OnlineStatusResponse.builder()
                .userId(userId)
                .online(online)
                .lastSeenAt(lastSeenAt)
                .build();
    }



}

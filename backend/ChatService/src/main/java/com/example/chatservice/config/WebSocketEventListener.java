package com.example.chatservice.config;

import com.example.chatservice.dto.response.OnlineStatusResponse;
import com.example.chatservice.dto.response.SystemMessage;
import com.example.chatservice.entity.*;
import com.example.chatservice.repository.ConversationRepository;
import com.example.chatservice.repository.SocketSessionRepository;
import com.example.chatservice.service.AdminRoutingService;
import com.example.chatservice.service.ConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.util.List;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SocketSessionRepository socketSessionRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationRepository conversationRepository;
    private final AdminRoutingService adminRoutingService;
    private final RedisTemplate<String, String> redisTemplate;


    @EventListener
    @Transactional
    public void onConnected(SessionConnectEvent event) {
        // 1. Lấy thông tin từ STOMP frame
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        String userId    = accessor.getUser() != null ? accessor.getUser().getName() : null;

        if (userId == null) {
            log.warn("Connected session has no user");
            return;
        }

        // Lấy role từ authorities — ưu tiên ADMIN
        String role = "USER";
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            log.info("Authorities: {}", auth.getAuthorities());
            role = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.equals("ADMIN"))
                    .findFirst()
                    .orElseGet(() -> auth.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .findFirst()
                            .orElse("USER"));
        }

        // Lấy username từ details
        String username = "unknown";
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            username = auth.getDetails() != null ? auth.getDetails().toString() : userId;
        }

        // 2. Lưu session vào Redis
        SocketSession session = SocketSession.builder()
                .socketSessionId(sessionId)
                .userId(userId)
                .username(username)
                .role(role)
                .connectedAt(LocalDateTime.now())
                .build();
        socketSessionRepository.save(session);

        // 3. Broadcast online status
        messagingTemplate.convertAndSend("/topic/online-status",
                OnlineStatusResponse.builder()
                        .userId(userId)
                        .online(true)
                        .build());

        log.info("User {} connected, role={}, sessionId={}", userId, role, sessionId);

        // Nếu là ADMIN → pick up các conversation PENDING
        if ("ADMIN".equals(role)) {

            adminRoutingService.resetAdminCount(userId);

            List<Conversation> pendingList = conversationRepository
                    .findByConversationTypeAndStatus(
                            ConversationType.SUPPORT,
                            ConversationStatus.PENDING
                    );

            for (Conversation conv : pendingList) {
                if (adminRoutingService.getActiveChatCount(userId) >= 5) {
                    log.info("Admin {} is full, stop picking up", userId);
                    break;
                }

                // Kiểm tra admin đã là participant chưa
                boolean alreadyParticipant = conv.getParticipants().stream()
                        .anyMatch(p -> p.getUserId().equals(UUID.fromString(userId)));

                if (!alreadyParticipant) {
                    ConversationParticipant adminParticipant = ConversationParticipant.builder()
                            .conversation(conv)
                            .userId(UUID.fromString(userId))
                            .username("Support Team")
                            .build();
                    conv.getParticipants().add(adminParticipant);
                }

                conv.setStatus(ConversationStatus.ACTIVE);
                conversationRepository.save(conv);
                adminRoutingService.incrementActiveChat(userId);

                messagingTemplate.convertAndSendToUser(
                        userId,
                        "/queue/assigned",
                        conv.getId()
                );

                log.info("Admin {} picked up PENDING conversation {}", userId, conv.getId());
            }
        }
    }

    @EventListener
    @Transactional
    public void onDisconnected(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        if (accessor.getUser() == null) return;

        String userId    = accessor.getUser().getName();
        String sessionId = accessor.getSessionId();

        socketSessionRepository.deleteById(sessionId);

        List<SocketSession> remaining = socketSessionRepository.findByUserId(userId);

        if (remaining.isEmpty()) {
            LocalDateTime lastSeenAt = LocalDateTime.now();
            redisTemplate.opsForValue().set("last_seen:" + userId, lastSeenAt.toString(), 30, TimeUnit.DAYS);
            messagingTemplate.convertAndSend("/topic/online-status",
                    OnlineStatusResponse.builder()
                            .userId(userId)
                            .online(false)
                            .lastSeenAt(lastSeenAt)
                            .build());
            log.info("User {} is now offline", userId);

            // ✅ Nếu là ADMIN → reassign các conversation đang ACTIVE
            // Cần đọc role từ session vừa xóa — lấy từ Redis trước khi delete
            // (đã deleteById rồi nên cần query trước, xem lưu ý bên dưới)
            handleAdminDisconnect(userId);

        } else {
            log.info("User {} still has {} active sessions", userId, remaining.size());
        }
    }

    private void handleAdminDisconnect(String adminId) {
        // Tìm tất cả conversation ACTIVE mà admin này đang xử lý
        List<Conversation> adminConversations = conversationRepository.findActiveByAdminId(
                UUID.fromString(adminId),
                ConversationType.SUPPORT,
                ConversationStatus.ACTIVE
        );

        if (adminConversations.isEmpty()) return;

        log.info("Admin {} disconnected, reassigning {} conversations", adminId, adminConversations.size());

        // Reset counter của admin vừa disconnect
        adminRoutingService.resetAdminCount(adminId);

        for (Conversation conv : adminConversations) {
            // Tìm admin khác thay thế
            Optional<String> newAdminId = adminRoutingService.findBestAdmin();

            if (newAdminId.isPresent()) {
                // Xóa admin cũ khỏi participants
                conv.getParticipants().removeIf(
                        p -> p.getUserId().equals(UUID.fromString(adminId))
                );

                // Thêm admin mới vào
                conv.getParticipants().add(ConversationParticipant.builder()
                        .conversation(conv)
                        .userId(UUID.fromString(newAdminId.get()))
                        .username("Support Team")
                        .build());

                conversationRepository.save(conv);
                adminRoutingService.incrementActiveChat(newAdminId.get());

                // Notify admin mới
                messagingTemplate.convertAndSendToUser(
                        newAdminId.get(),
                        "/queue/assigned",
                        conv.getId()
                );

                log.info("Conversation {} reassigned to admin {}", conv.getId(), newAdminId.get());

            } else {
                // Không có admin nào online → về PENDING
                conv.getParticipants().removeIf(
                        p -> p.getUserId().equals(UUID.fromString(adminId))
                );
                conv.setStatus(ConversationStatus.PENDING);
                conversationRepository.save(conv);

                // Gửi system message cho user biết đang chờ
                messagingTemplate.convertAndSend(
                        "/topic/conversation." + conv.getId(),
                        SystemMessage.builder()
                                .type("SYSTEM")
                                .content("Hỗ trợ viên đã ngắt kết nối, đang tìm người hỗ trợ khác...")
                                .build()
                );

                log.info("Conversation {} set to PENDING — no admin available", conv.getId());
            }
        }
    }
}
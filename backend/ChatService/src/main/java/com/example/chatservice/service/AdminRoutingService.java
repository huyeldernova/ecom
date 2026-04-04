package com.example.chatservice.service;

import com.example.chatservice.entity.SocketSession;
import com.example.chatservice.repository.SocketSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminRoutingService {

    private final SocketSessionRepository socketSessionRepository;
    private final StringRedisTemplate redisTemplate;

    private static final int MAX_CHATS_PER_ADMIN = 5;
    private static final String CHAT_COUNT_KEY = "admin:active_chats:";

    public int getActiveChatCount(String adminId){
        String val = redisTemplate.opsForValue().get(CHAT_COUNT_KEY + adminId);
        return val == null ? 0 : Integer.parseInt(val);

    }

    public List<String> getOnlineAdmins(){
        List<SocketSession> allSessions = new ArrayList<>();
        socketSessionRepository.findAll().forEach(allSessions::add);

        log.info("=== All sessions count: {}", allSessions.size());
        allSessions.forEach(s ->
                log.info("=== Session: userId={}, role={}", s.getUserId(), s.getRole())
        );

        return allSessions.stream()
                .filter(s -> "ADMIN".equals(s.getRole()))
                .map(SocketSession::getUserId)
                .distinct()
                .collect(Collectors.toList());
    }

    public Optional<String> findBestAdmin() {
        List<String> onlineAdmins = getOnlineAdmins();
        log.info("Online admins: {}", onlineAdmins);
        log.info("=== Online admins count: {}", onlineAdmins.size());
        log.info("=== Online admins list: {}", onlineAdmins);

        if (onlineAdmins.isEmpty()) return Optional.empty();

        return onlineAdmins.stream()
                .filter(id -> getActiveChatCount(id) < MAX_CHATS_PER_ADMIN)
                .min(Comparator.comparingInt(this::getActiveChatCount));
    }

    public void incrementActiveChat(String adminId) {
        redisTemplate.opsForValue().increment(CHAT_COUNT_KEY + adminId);
        log.info("Admin {} active chats: {}", adminId, getActiveChatCount(adminId));
    }

    public void decrementActiveChat(String adminId) {
        Long count = redisTemplate.opsForValue().decrement(CHAT_COUNT_KEY + adminId);
        // Không để xuống âm
        if (count != null && count < 0) {
            redisTemplate.opsForValue().set(CHAT_COUNT_KEY + adminId, "0");
        }
    }

    public void resetAdminCount(String adminId) {
        redisTemplate.delete(CHAT_COUNT_KEY + adminId);
        log.info("Reset active chat count for admin {}", adminId);
    }




}
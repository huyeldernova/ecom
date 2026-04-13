package com.example.notificationservice.event;

import com.example.event.UserRegisteredEvent;
import com.example.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventListener {
    private final NotificationService notificationService;

    @KafkaListener(topics = "user.registered", groupId = "notification-service")
    public void handleUserRegistered(UserRegisteredEvent event, Acknowledgment acknowledgment) {
        log.info("Received user.registered for userId: {}", event.getUserId());
        try {
            notificationService.handleUserRegistered(event);
            acknowledgment.acknowledge();
            log.info("Offset committed for userId: {}", event.getUserId());
        } catch (Exception e) {
            log.error("Failed to process user.registered for userId: {}", event.getUserId(), e);
        }
    }
}

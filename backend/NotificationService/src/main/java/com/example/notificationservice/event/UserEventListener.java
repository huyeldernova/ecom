package com.example.notificationservice.event;

import com.example.event.UserRegisteredEvent;
import com.example.event.UserVerifiedEvent;
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

    @KafkaListener(topics = "user.verified", groupId = "notification-service")
    public void handleUserVerified(UserVerifiedEvent event, Acknowledgment ack) {
        log.info("Received user.verified for userId: {}", event.getUserId());
        try {
            notificationService.handleUserVerified(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to handle user.verified: {}", event.getUserId(), e);
        }
    }
}

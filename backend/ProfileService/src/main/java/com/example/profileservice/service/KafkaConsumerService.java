package com.example.profileservice.service;

import com.example.event.UserRegisteredEvent;
import com.example.event.UserVerifiedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumerService {

    private final ProfileService profileService;

    @KafkaListener(topics = "user.verified", groupId = "profile-service")
    public void handleUserVerified(UserVerifiedEvent event, Acknowledgment ack) {
        log.info("Received user.verified for userId: {}", event.getUserId());
        try {
            profileService.createProfile(event.getUserId(), event.getName());
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to create profile for userId: {}", event.getUserId(), e);
        }
    }
}
package com.example.profileservice.service;

import com.example.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumerService {

    private final ProfileService profileService;

    @KafkaListener(topics = "user.registered", groupId = "profile-service")
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Received user.registered event for userId: {}", event.getUserId());
        profileService.createProfile(
                event.getUserId(),
                event.getName()
        );
    }
}
package com.example.chatservice.controller;

import com.example.chatservice.dto.request.ChatMessageRequest;
import com.example.chatservice.exception.AppException;
import com.example.chatservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j(topic = "CHAT")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat")
    public void handleChat(@Payload ChatMessageRequest request, Principal principal) {

        if (principal == null) {
            log.warn("Anonymous sender — message rejected");
            return;
        }

        String senderId = principal.getName();

        // Lấy username từ UsernamePasswordAuthenticationToken
        String senderUsername = senderId; // fallback
        if (principal instanceof org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth) {
            // username được set trong ClientInboundAuthentication
            Object details = auth.getDetails();
            if (details instanceof String) {
                senderUsername = (String) details;
            }
        }

        try {
            chatService.sendChatMessage(senderId, senderUsername, request);
            log.info("Message sent by {} to conversation {}", senderId, request.getConversationId());
        } catch (AppException ex) {
            log.warn("Chat error for user {}: {}", senderId, ex.getMessage());
            messagingTemplate.convertAndSendToUser(
                    senderId, "/queue/errors", ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error for user {}", senderId, ex);
            messagingTemplate.convertAndSendToUser(
                    senderId, "/queue/errors", "Internal server error");
        }
    }
}

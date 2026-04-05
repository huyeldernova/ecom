package com.example.chatservice.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadReceiptResponse {
    private String userId;
    private UUID conversationId;
    private LocalDateTime lastReadAt;
}

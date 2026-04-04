package com.example.chatservice.dto.response;

import com.example.chatservice.entity.ConversationType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ConversationDetailResponse {
    private UUID id;
    private ConversationType conversationType;
    private String conversationName;
    private String conversationAvatar;
    private List<ParticipantInfo> participants;
    private String lastMessageContent;
    private LocalDateTime lastMessageTime;
    private LocalDateTime lastActivityTime;
}
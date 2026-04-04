package com.example.chatservice.dto.response;


import com.example.chatservice.entity.ConversationType;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationCreationResponse implements Serializable {

    private UUID id;
    private ConversationType conversationType;
    private String participantHash;
    private String conversationAvatar;
    private String conversationName;
    private List<ParticipantInfo> participantInfo;
    private LocalDateTime createdAt;
    private String conversationCreatedBy;
}
package com.example.chatservice.dto.response;


import com.example.chatservice.common.MessageType;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder(toBuilder = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse implements Serializable {
    private String id;
    private String tempId;
    private String conversationId;
    private String conversationAvatar;
    private String username;
    private Boolean me;
    private String conversationType;
    private String message;
    private List<UUID> fileIds;      // đổi từ List<MessageMedia> messageMedia
    private MessageType messageType;
    private List<String> participants;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm")
    private LocalDateTime createdAt;
    private String conversationCreatedBy;
}

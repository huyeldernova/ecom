package com.example.chatservice.dto.request;


import com.example.chatservice.common.MessageType;
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ChatMessageRequest implements Serializable {
    private String tempId;
    private UUID conversationId;
    @JsonAlias({"content", "message"})
    private String message;
    private List<UUID> fileIds;
    @JsonAlias({"type", "messageType"})
    private MessageType messageType;
}

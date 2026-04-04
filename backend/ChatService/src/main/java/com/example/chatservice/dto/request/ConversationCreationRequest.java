package com.example.chatservice.dto.request;

import com.example.chatservice.entity.ConversationType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


import java.util.Map;

@Getter
@Setter
public class ConversationCreationRequest {

    @NotNull(message = "Conversation Type cannot be blank")
    private ConversationType conversationType;

    @Size(max = 100, message = "Conversation Name must be less than 100 characters")
    private String conversationName;

    private String conversationAvatar;

    // key = userId, value = username
    @NotEmpty(message = "Participant cannot be null")
    private Map<String, String> participants;
}
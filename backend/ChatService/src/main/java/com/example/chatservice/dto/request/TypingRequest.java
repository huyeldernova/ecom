package com.example.chatservice.dto.request;

import lombok.Getter;
import lombok.Setter;



@Getter
@Setter
public class TypingRequest {
    private String conversationId;
    private boolean  typing;
}

package com.example.chatservice.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class SystemMessage {
    private String type;
    private String content;
}
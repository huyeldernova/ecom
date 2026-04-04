package com.example.chatservice.dto.response;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class ParticipantInfo {
    private UUID userId;
    private String username;
    private boolean me;
}
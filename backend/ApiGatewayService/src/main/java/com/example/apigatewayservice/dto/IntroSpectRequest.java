package com.example.apigatewayservice.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter

public class IntroSpectRequest {
    private String token;
}
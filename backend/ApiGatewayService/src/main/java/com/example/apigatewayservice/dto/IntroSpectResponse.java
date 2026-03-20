package com.example.apigatewayservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class IntroSpectResponse {
    private boolean isValid;
    private List<String> authorities;
}

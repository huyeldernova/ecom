package com.example.apigatewayservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class IntroSpectResponse {

    @JsonProperty("isValid")
    private boolean isValid;
    private List<String> authorities;
}

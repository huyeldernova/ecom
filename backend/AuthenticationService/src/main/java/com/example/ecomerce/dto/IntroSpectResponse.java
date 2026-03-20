package com.example.ecomerce.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@Builder
public class IntroSpectResponse {
    private boolean isValid;
    private List<String> authorities;
}

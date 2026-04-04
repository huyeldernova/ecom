package com.example.ecomerce.dto;

import lombok.*;

import java.util.List;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IntroSpectResponse {
    private boolean isValid;
    private List<String> authorities;
}

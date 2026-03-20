package com.example.ecomerce.dto.reponse;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@Builder
public class TokenVerificationResponse implements Serializable {
    private boolean isValid;
    private List<String> authorities;
    private String reason;
}

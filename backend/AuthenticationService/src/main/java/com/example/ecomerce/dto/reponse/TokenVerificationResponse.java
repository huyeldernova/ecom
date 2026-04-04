package com.example.ecomerce.dto.reponse;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenVerificationResponse implements Serializable {
    @JsonProperty("isValid")
    private boolean isValid;
    private List<String> authorities;
    private String reason;
}

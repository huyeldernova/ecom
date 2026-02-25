package com.example.ecomerce.dto.reponse;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;


@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginResponse implements Serializable {
    private String userId;
    private String accessToken;
    private String refreshToken;
    private List<String> authorities;
}
package com.example.apigatewayservice.client;

import com.example.apigatewayservice.dto.ApiResponses;
import com.example.apigatewayservice.dto.IntroSpectRequest;
import com.example.apigatewayservice.dto.IntroSpectResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AuthenticationClient {

    private final WebClient webclient;

    public Mono<ApiResponses<IntroSpectResponse>> introspect(IntroSpectRequest request) {
        return webclient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/authentication/api/v1/auth/introspect")
                        .build())
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {});
    }
}

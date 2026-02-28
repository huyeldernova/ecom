package com.example.apigatewayservice.config;

import com.example.apigatewayservice.client.AuthenticationClient;
import com.example.apigatewayservice.dto.IntroSpectRequest;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
@Configuration
@RequiredArgsConstructor
public class GlobalFilterAuthentication implements GlobalFilter, Ordered {

    private static final String[] PUBLIC_ENDPOINTS = {
            "/authentication/api/v1/auth/**"
    };

    private final AuthenticationClient authenticationClient;

    @Override
    public Mono<Void> filter(@NonNull ServerWebExchange exchange, @NonNull GatewayFilterChain chain) {

        if(isPublicEndpoint(exchange)){
            return chain.filter(exchange);
        }

        List<String> authHeader = exchange.getRequest().getHeaders().get("Authorization");

        if(authHeader == null || authHeader.isEmpty()){
            return Mono.error(new RuntimeException("Missing Authorization header"));
        }

            String token =  authHeader.getFirst().replace("Bearer ", "");
            IntroSpectRequest request = IntroSpectRequest.builder()
                    .token(token)
                    .build();

            return authenticationClient.introspect(request).flatMap(introSpectResponse -> {
                if(introSpectResponse.getResult().isValid()){
                    return chain.filter(exchange);
                }else{
                    return Mono.error(new RuntimeException("Invalid token"));
                }
            });
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private boolean isPublicEndpoint(ServerWebExchange exchange){
        return Arrays.stream(PUBLIC_ENDPOINTS)
                .anyMatch(p -> exchange.getRequest().getURI().getPath().matches(p));
    }
}

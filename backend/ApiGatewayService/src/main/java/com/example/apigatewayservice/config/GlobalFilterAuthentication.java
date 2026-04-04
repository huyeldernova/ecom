package com.example.apigatewayservice.config;

import com.example.apigatewayservice.client.AuthenticationClient;
import com.example.apigatewayservice.dto.IntroSpectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
@Configuration
@RequiredArgsConstructor
@Slf4j
public class GlobalFilterAuthentication implements GlobalFilter, Ordered {

    private static final String[] PUBLIC_ENDPOINTS = {
            "/authentication/api/v1/auth/**",
            "/authentication/api/v1/users/register",
            "/authentication/api/v1/auth/login",
            "/payment/api/payment/webhook",// Stripe webhook không có JWT
            "/chat-service/ws/**"
    };

    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final AuthenticationClient authenticationClient;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        if (isPublicEndpoint(exchange)) {
            return chain.filter(exchange);
        }

        String bearerToken = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            return unauthorizedResponse(exchange);
        }

        String token = bearerToken.substring(7);

        return authenticationClient
                .introspect(IntroSpectRequest.builder().token(token).build())
                .flatMap(resp -> {
                    log.info("Introspect result: {}", resp.getResult());
                    if (resp.getResult().isValid()) {
                        log.info("Token valid for path: {}",
                                exchange.getRequest().getURI().getPath());
                        return chain.filter(exchange);
                    }
                    return unauthorizedResponse(exchange);
                })
                .onErrorResume(throwable -> {
                    log.error("Auth service error: {}", throwable.getMessage());
                    return unauthorizedResponse(exchange);
                });
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private boolean isPublicEndpoint(ServerWebExchange exchange) {
        String path = exchange.getRequest().getURI().getPath();
        return Arrays.stream(PUBLIC_ENDPOINTS)
                .anyMatch(p -> pathMatcher.match(p, path));
    }

    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders()
                .setContentType(MediaType.APPLICATION_JSON);
        String json = "{\"code\": 401, \"message\": \"Unauthorized\"}";
        DataBuffer buffer = exchange.getResponse().bufferFactory()
                .wrap(json.getBytes(StandardCharsets.UTF_8));
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}

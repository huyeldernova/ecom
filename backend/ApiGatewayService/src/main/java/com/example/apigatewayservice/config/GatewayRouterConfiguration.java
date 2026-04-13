package com.example.apigatewayservice.config;


import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

@Configuration
public class GatewayRouterConfiguration {

    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                .route("block-internal", r -> r
                        .path("/*/internal/**", "/internal/**")
                        .filters(f -> f.setStatus(HttpStatus.FORBIDDEN))
                        .uri("no://op"))

                // AuthService (8080)
                .route("authentication-service", r -> r
                        .path("/authentication/**")
                        .uri("http://localhost:8080"))

                // ProductService (8081)
                .route("product-service", r -> r
                        .path("/product/**")
                        .uri("http://localhost:8081"))

                // InventoryService (8082)
                .route("inventory-service", r -> r
                        .path("/inventory/**")
                        .uri("http://localhost:8082"))

                // CartService (8083)
                .route("cart-service", r -> r
                        .path("/cart/**")
                        .uri("http://localhost:8083"))

                // OrderService (8084)
                .route("order-service", r -> r
                        .path("/order/**")
                        .uri("http://localhost:8084"))

                // PaymentService (8085)
                .route("payment-service", r -> r
                        .path("/payment/**")
                        .uri("http://localhost:8085"))

                //  FileService (8087)
                .route("file-service", r -> r
                        .path("/file/**")
                        .uri("http://localhost:8087"))

                // HTTP routes cho ChatService
                .route(r -> r.path("/chat-service/api/**")
                        .uri("http://localhost:8088"))

                // WebSocket route — dùng ws:// protocol
                .route(r -> r.path("/chat-service/ws/**")
                        .uri("ws://localhost:8088"))

                .route(r -> r
                        .path("/notification//**")
                        .uri("http://localhost:8089"))

                .build();
    }
}
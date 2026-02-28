package com.example.apigatewayservice.config;


import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRouterConfiguration {
    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder){
        return builder.routes()
                .route(r -> r.path("/product/**")
                        .uri("http://localhost:8081"))

                .route(r -> r.path("/cart/**")
                        .uri("http://localhost:8082"))

                .route(r -> r.path("/authentication/**")
                        .uri("http://localhost:8080"))

                .build();

    }
}

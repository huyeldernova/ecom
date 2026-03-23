package com.example.cartservice.client;

import com.example.cartservice.dto.ApiResponses;
import com.example.cartservice.dto.client.VariantResponse;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

import java.util.UUID;

@HttpExchange(url = "http://localhost:8081/product")
public interface ProductClient {

    @GetExchange ("/api/v1/products/{productId}/variants/{variantId}")
    ApiResponses<VariantResponse> getVariantById(@RequestHeader("Authorization") String token, @PathVariable UUID productId, @PathVariable UUID variantId);

}

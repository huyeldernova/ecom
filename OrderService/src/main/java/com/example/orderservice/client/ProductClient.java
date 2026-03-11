package com.example.orderservice.client;

import com.example.orderservice.dto.ApiResponses;
import com.example.orderservice.dto.client.product.VariantResponse;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

import java.util.UUID;

@HttpExchange(url = "http://localhost:8081/product")
public interface ProductClient {

    @GetExchange("/api/v1/products/variants/{variantId}")
    ApiResponses<VariantResponse> getVariantById(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID variantId
    );
}
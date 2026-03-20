package com.example.cartservice.client;

import com.example.cartservice.dto.ApiResponses;
import com.example.cartservice.dto.client.VariantResponse;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

import java.util.UUID;

@HttpExchange(url = "http://localhost:8081/product")
public interface ProductClient {

    @GetExchange ("/{productId}/variants/{variantId}")
    ApiResponses<VariantResponse> getVariantById(@PathVariable UUID productId, @PathVariable UUID variantId);

}

package com.example.cartservice.client;

import com.example.cartservice.dto.ApiResponses;
import com.example.cartservice.dto.client.InventoryResponse;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

import java.util.UUID;

@HttpExchange(url = "http://localhost:8082/inventory")
public interface InventoryClient {

    @GetExchange("/internal/inventories/{variantId}")
    ApiResponses<InventoryResponse> getInventory(
            @RequestHeader("X-Internal-Key") String apiKey,
            @PathVariable UUID variantId
    );
}
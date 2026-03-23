package com.example.orderservice.client;

import com.example.orderservice.dto.ApiResponses;
import com.example.orderservice.dto.client.inventory.InventoryResponse;
import com.example.orderservice.dto.client.inventory.ReleaseStockRequest;
import com.example.orderservice.dto.client.inventory.ReserveStockRequest;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

@HttpExchange(url = "http://localhost:8082/inventory")
public interface InventoryClient {

    @PostExchange("/internal/inventories/reserve")
    ApiResponses<InventoryResponse> reserveStock(
            @RequestHeader(value = "X-Internal-Key", defaultValue = "super-secret-internal-key-123") String apiKey,
            @RequestBody ReserveStockRequest request
    );

    @PostExchange("/internal/inventories/release")
    ApiResponses<InventoryResponse> releaseStock(
            @RequestHeader(value = "X-Internal-Key", defaultValue = "super-secret-internal-key-123") String apiKey,
            @RequestBody ReleaseStockRequest request
    );
}
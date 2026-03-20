package com.example.orderservice.client;

import com.example.orderservice.dto.ApiResponses;
import com.example.orderservice.dto.client.inventory.InventoryResponse;
import com.example.orderservice.dto.client.inventory.ReleaseStockRequest;
import com.example.orderservice.dto.client.inventory.ReserveStockRequest;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

@HttpExchange(url = "http://localhost:8084/inventory")
public interface InventoryClient {

    @PostExchange("/api/inventories/reserve")
    ApiResponses<InventoryResponse> reserveStock(@RequestHeader("Authorization") String token, @RequestBody ReserveStockRequest request);

    @PostExchange("/api/inventories/release")
    ApiResponses<InventoryResponse> releaseStock(@RequestHeader("Authorization") String token, @RequestBody ReleaseStockRequest request);
}

package com.example.paymentservice.client;

import com.example.paymentservice.dto.ApiResponses;
import com.example.paymentservice.dto.client.inventory.DeductStockRequest;
import com.example.paymentservice.dto.client.inventory.ReleaseStockRequest;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

@HttpExchange(url = "http://localhost:8082/inventory")
public interface InventoryClient {

    @PostExchange("/internal/inventories/deduct")
    ApiResponses<Void> deductStock(@RequestHeader("X-Internal-Key") String apiKey, @RequestBody DeductStockRequest request);

    @PostExchange("/internal/inventories/release")
    ApiResponses<Void> releaseStock(@RequestHeader("X-Internal-Key") String apiKey, @RequestBody ReleaseStockRequest request);

    }



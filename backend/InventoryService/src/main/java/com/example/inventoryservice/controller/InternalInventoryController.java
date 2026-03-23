package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.*;
import com.example.inventoryservice.exception.AppException;
import com.example.inventoryservice.exception.ErrorCode;
import com.example.inventoryservice.service.InventoryCommandService;
import com.example.inventoryservice.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/inventories")
@RequiredArgsConstructor
public class InternalInventoryController {

    private final InventoryCommandService inventoryCommandService;
    private final InventoryService inventoryService;

    private static final String INTERNAL_API_KEY = "super-secret-internal-key-123";

    private void validateApiKey(String apiKey) {
        if (!INTERNAL_API_KEY.equals(apiKey)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @PostMapping
    public ApiResponses<InventoryResponse> createInventory(
            @RequestHeader("X-Internal-Key") String apiKey,
            @RequestBody CreateInventoryRequest request) {

        validateApiKey(apiKey);

        return ApiResponses.<InventoryResponse>builder()
                .code(1000)
                .message("Inventory created")
                .data(inventoryService.createInventory(request))
                .build();
    }

    @PostMapping("/reserve")
    public ApiResponses<InventoryResponse> reserveStock(
            @RequestHeader("X-Internal-Key") String apiKey,
            @RequestBody ReserveStockRequest request) {

        validateApiKey(apiKey);

        return ApiResponses.<InventoryResponse>builder()
                .code(1000)
                .message("Stock reserved")
                .data(inventoryCommandService.reserveStock(request))
                .build();
    }

    @PostMapping("/deduct")
    public ApiResponses<InventoryResponse> deductStock(
            @RequestHeader("X-Internal-Key") String apiKey,
            @RequestBody DeductStockRequest request) {

        validateApiKey(apiKey);

        return ApiResponses.<InventoryResponse>builder()
                .code(1000)
                .message("Stock deducted")
                .data(inventoryCommandService.deductStock(request))
                .build();
    }

    @PostMapping("/release")
    public ApiResponses<InventoryResponse> releaseStock(
            @RequestHeader("X-Internal-Key") String apiKey,
            @RequestBody ReleaseStockRequest request) {

        validateApiKey(apiKey);

        return ApiResponses.<InventoryResponse>builder()
                .code(1000)
                .message("Stock released")
                .data(inventoryService.releaseStock(request))
                .build();
    }
}
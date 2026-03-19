package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.ApiResponses;
import com.example.inventoryservice.dto.DeductStockRequest;

import com.example.inventoryservice.dto.ReleaseStockRequest;
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

    @PostMapping("/deduct")
    public ApiResponses<Void> deductStock(@RequestHeader("X-Internal-Key") String apiKey, @RequestBody DeductStockRequest request) {

        if (!INTERNAL_API_KEY.equals(apiKey)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        inventoryCommandService.deductStock(request);

        return ApiResponses.<Void>builder()
                .code(1000)
                .message("Stock deduct Stock")
                .build();
    }

    @PostMapping("/release")
    public ApiResponses<Void> releaseStock(@RequestHeader("X-Internal-Key") String apiKey, @RequestBody ReleaseStockRequest request) {

        if (!INTERNAL_API_KEY.equals(apiKey)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        inventoryService.releaseStock(request);

        return ApiResponses.<Void>builder()
                .code(1000)
                .message("Stock release")
                .build();

    }
}
package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.*;
import com.example.inventoryservice.service.InventoryCommandService;
import com.example.inventoryservice.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryCommandService inventoryCommandService;

    // ProductService
    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCT_SERVICE')")
    public ApiResponses<InventoryResponse> createInventory(@RequestBody CreateInventoryRequest request) {

        return ApiResponses.<InventoryResponse>builder()
                .code(1000)
                .message("Inventory created")
                .data(inventoryService.createInventory(request))
                .build();
    }

    // Admin, OrderService, CartService
    @GetMapping("/{variantId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ORDER_SERVICE','CART_SERVICE')")
    public ApiResponses<InventoryResponse> getInventory(@PathVariable UUID variantId) {

        return ApiResponses.<InventoryResponse>builder()
                .code(1000)
                .message("Success")
                .data(inventoryService.getInventory(variantId))
                .build();
    }

    // Admin only
    @GetMapping("/{variantId}/transactions")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponses<PageResponse<InventoryTransactionResponse>> getTransactions(
            @PathVariable UUID variantId,
            @ModelAttribute TransactionFilterRequest request
    ) {

        request.setProductVariantId(variantId);

        return ApiResponses.<PageResponse<InventoryTransactionResponse>>builder()
                .code(1000)
                .message("Success")
                .data(inventoryService.getAllTransactions(request))
                .build();
    }

    // Admin
    @PostMapping("/{variantId}/import")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponses<InventoryResponse> importStock(
            @PathVariable UUID variantId,
            @RequestBody ImportStockRequest request
    ) {

        request.setProductVariantId(variantId);

        return ApiResponses.<InventoryResponse>builder()
                .code(1000)
                .message("Stock imported")
                .data(inventoryService.importStock(request))
                .build();
    }

    // OrderService
    @PostMapping("/deduct")
    @PreAuthorize("hasAuthority('ORDER_SERVICE')")
    public ApiResponses<InventoryResponse> deductStock(@RequestBody DeductStockRequest request) {

        return ApiResponses.<InventoryResponse>builder()
                .code(1000)
                .message("Stock deducted")
                .data(inventoryCommandService.deductStock(request))
                .build();
    }

    // OrderService
    @PostMapping("/release")
    @PreAuthorize("hasAuthority('ORDER_SERVICE')")
    public ApiResponses<InventoryResponse> releaseStock(@RequestBody ReleaseStockRequest request) {

        return ApiResponses.<InventoryResponse>builder()
                .code(1000)
                .message("Stock released")
                .data(inventoryService.releaseStock(request))
                .build();
    }

    @PostMapping("/reserve")
    @PreAuthorize("hasAuthority('ORDER_SERVICE')")
    public ApiResponses<InventoryResponse> reserveStock(@RequestBody ReserveStockRequest request) {
        return ApiResponses.<InventoryResponse>builder()
                .code(1000)
                .message("stock reserve")
                .data(inventoryCommandService.reserveStock(request))
                .build();
    }
}
package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.*;
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

    @GetMapping("/{variantId}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
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


    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponses<PageResponse<InventoryListItemResponse>> getAll(@ModelAttribute InventoryFilterRequest filter) {
        return ApiResponses.<PageResponse<InventoryListItemResponse>>builder()
                .code(200)
                .message("Success")
                .data(inventoryService.getAll(filter))
                .build();
    }

    @GetMapping("/kpis")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponses<InventoryKPIsResponse> getKPIs() {
        return ApiResponses.<InventoryKPIsResponse>builder()
                .code(200).message("Success")
                .data(inventoryService.getKPIs())
                .build();
    }


}
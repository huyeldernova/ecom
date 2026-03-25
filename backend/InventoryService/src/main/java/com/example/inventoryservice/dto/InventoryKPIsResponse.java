package com.example.inventoryservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryKPIsResponse {
    private long totalProducts;
    private long inStock;
    private long lowStock;
    private long outOfStock;
}
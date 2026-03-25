package com.example.inventoryservice.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class InventoryItemResponse {
    private UUID pid;         // productVariantId
    private String name;
    private String sku;
    private String category;
    private BigDecimal price;
    private int stock;
    private int reservedQuantity;
    private int threshold;
    private int sold7;
    private String status;    // IN_STOCK / LOW_STOCK / OUT_OF_STOCK
}
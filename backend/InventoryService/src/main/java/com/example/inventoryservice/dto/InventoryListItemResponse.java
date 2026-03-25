package com.example.inventoryservice.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryListItemResponse {

    private UUID productVariantId;

    private Integer stock;

    private Integer reservedQuantity;

    private Integer availableQuantity;

    private Integer threshold;

    private Integer sold7;

    private String status;            // IN_STOCK | LOW_STOCK | OUT_OF_STOCK
}

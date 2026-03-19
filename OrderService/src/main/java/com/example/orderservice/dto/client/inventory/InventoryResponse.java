package com.example.orderservice.dto.client.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {

    private UUID productVariantId;
    private Integer quantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;

}

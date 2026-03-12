package com.example.inventoryservice.dto;

import com.example.inventoryservice.entity.TransactionType;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionResponse {

    private UUID productVariantId;

    private TransactionType type;

    private Integer quantity;

    private String reason;

    private Instant createdAt;
}


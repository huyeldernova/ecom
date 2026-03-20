package com.example.orderservice.dto.client.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReserveStockRequest {
    @NotNull
    private UUID productVariantId;

    @NotNull
    @Min(1)
    private Integer quantity;

    @NotNull
    private UUID orderId;
}

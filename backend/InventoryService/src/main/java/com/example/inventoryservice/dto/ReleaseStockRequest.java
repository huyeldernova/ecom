package com.example.inventoryservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReleaseStockRequest {

    @NotNull
    private UUID productVariantId;

    @NotNull
    @Min(1)
    private Integer quantity;

    @NotNull
    private UUID orderId;
}

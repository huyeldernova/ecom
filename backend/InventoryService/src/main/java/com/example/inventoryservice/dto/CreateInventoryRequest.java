package com.example.inventoryservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CreateInventoryRequest {
    @NotNull
    private UUID productVariantId;

    @NotNull
    @Min(0) // ← tại sao Min(0) chứ không phải Min(1)?
    private Integer quantity;
}

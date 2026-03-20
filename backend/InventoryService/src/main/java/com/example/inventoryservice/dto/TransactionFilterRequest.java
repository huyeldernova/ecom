package com.example.inventoryservice.dto;

import com.example.inventoryservice.entity.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class TransactionFilterRequest {

    @Min(value = 0, message = "Page must be greater than or equal to 0")
    private int page = 0;

    @Min(value = 1, message = "Size must be greater than 0")
    private int size = 10;

    @NotNull
    private UUID productVariantId;

    private TransactionType type;

    private String reason;

    private Instant  from;

    private Instant to;
}

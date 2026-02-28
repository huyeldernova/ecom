package com.example.cartservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.UUID;

@Getter
public class UpdateVariantRequest {
    @NotNull(message = "Product variant is required")
    private UUID productVariantId;
}

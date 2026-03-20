package com.example.cartservice.dto.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariantResponse {
    private BigDecimal effectivePrice;
    private Boolean isActive;
}

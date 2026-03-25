package com.example.cartservice.dto.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariantResponse {
    private BigDecimal effectivePrice;
    private Boolean isActive;
    private String size;
    private String color;
    private String productName;
    private List<String> imageUrls;
}

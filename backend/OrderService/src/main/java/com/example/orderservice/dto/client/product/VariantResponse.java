package com.example.orderservice.dto.client.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantResponse {

    private UUID id;

    private String sku;

    private String size;

    private String color;

    private BigDecimal finalPrice;

    private BigDecimal effectivePrice;

    private String productName;

    private String variantName;

    private Integer stockQuantity;

    private List<String> imageUrls;

    private Boolean isActive;

}
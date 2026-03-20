package com.example.productservice.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantUpdateRequest {

    @Size(max = 100, message = "SKU must not exceed 100 characters")
    private String sku;

    @Size(max = 50, message = "Size must not exceed 50 characters")
    private String size;

    @Size(max = 50, message = "Color must not exceed 50 characters")
    private String color;

    @DecimalMin(value = "0.01", message = "Final price must be greater than 0")
    @Digits(integer = 15, fraction = 2, message = "Final price must have up to 15 integer digits and 2 decimal places")
    private BigDecimal finalPrice;

//    @Min(value = 0, message = "Stock quantity must be greater than or equal to 0")
//    private Integer stockQuantity;

    private List<String> imageUrls;
}

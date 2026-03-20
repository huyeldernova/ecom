package com.example.productservice.dto;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request object for filtering and paginating products")
public class ProductFilterRequest {

    @Schema(description = "Product name (partial match supported)", example = "iPhone", required = false)
    private String name;

    @Schema(description = "Brand name", example = "Apple", required = false)
    private String brand;

    @Schema(description = "Category ID", example = "550e8400-e29b-41d4-a716-446655440000", required = false)
    private UUID categoryId;

    @Schema(description = "Minimum price (inclusive)", example = "5000000", required = false)
    private BigDecimal minPrice;

    @Schema(description = "Maximum price (inclusive)", example = "35000000", required = false)
    private BigDecimal maxPrice;

    @Schema(description = "Page number (0-based)", example = "0", defaultValue = "0", required = false)
    @PositiveOrZero(message = "Page must be greater than or equal to 0")
    @Builder.Default
    private int page = 0;

    @Schema(description = "Page size (number of items per page)", example = "10", defaultValue = "10", required = false)
    @Min(value = 1, message = "Size must be at least 1")
    @Builder.Default
    private int size = 10;

}
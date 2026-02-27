package com.example.productservice.dto;

import jakarta.validation.constraints.*;
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
public class ProductUpdateRequest {

        @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
        private String name;

        @Size(min = 2, max = 100, message = "Brand must be between 2 and 100 characters")
        private String brand;

        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        @Digits(integer = 15, fraction = 2, message = "Price must have up to 15 integer digits and 2 decimal places")
        private BigDecimal price;

        private UUID categoryId;

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        private String description;

        private String thumbnailUrl;

        private List<String> imageUrls;

}

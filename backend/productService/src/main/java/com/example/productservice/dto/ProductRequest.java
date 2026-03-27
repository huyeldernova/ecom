package com.example.productservice.dto;

import jakarta.validation.Valid;
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
public class ProductRequest {

    @NotBlank(message = "Product name must not be blank")
    @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
    private String name;

    @NotBlank(message = "Brand must not be blank")
    @Size(min = 2, max = 100, message = "Brand must be between 2 and 100 characters")
    private String brand;

    @NotNull(message = "Price must not be null")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Digits(integer = 15, fraction = 2, message = "Price must have up to 15 integer digits and 2 decimal places")
    private BigDecimal price;

    @NotNull(message = "Category ID must not be null")
    private UUID categoryId;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private List<UUID> fileIds;

    private String thumbnailUrl;

    private List<String> imageUrls;

    @Valid
    private List<VariantRequest> variants;
}
package com.example.productservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductSummaryResponse {

    private UUID id;

    private String name;

    private String slug;

    private String brand;

    private BigDecimal price;

    private String thumbnailUrl;

    private String status;

    private UUID categoryId;
}
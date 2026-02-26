package com.example.productservice.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private UUID id;

    private String name;

    private String slug;

    private String description;

    private String imageUrl;

    private Integer displayOrder;

    private Boolean isActive;

    private UUID parentId;

    private List<CategoryResponse> children;
}
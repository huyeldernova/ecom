package com.example.productservice.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateRequest {
    @Size(max = 100)
    private String name;

    private UUID parentId;
    private Integer displayOrder;
    private String description;
    private String imageUrl;
    private Boolean isActive;
}

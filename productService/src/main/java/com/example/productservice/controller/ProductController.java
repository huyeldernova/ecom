package com.example.productservice.controller;

import com.example.productservice.dto.*;
import com.example.productservice.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product", description = "Product management API")
@SecurityRequirement(name = "bearerAuth")
public class ProductController {

    private final ProductService productService;

    // ==================== PRODUCT ENDPOINTS ====================

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(
            summary = "Create a new product",
            description = "Creates a new product. Only users with **ADMIN** role can perform this action."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Product created successfully",
                    content = @Content(schema = @Schema(implementation = ProductDetailResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data",
                    content = @Content(schema = @Schema(implementation = com.example.productservice.dto.ApiResponses.class))),
            @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required")
    })
    public com.example.productservice.dto.ApiResponses<ProductDetailResponse> create(
            @RequestBody @Valid ProductRequest request) {

        return com.example.productservice.dto.ApiResponses.<ProductDetailResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Product created successfully")
                .data(productService.create(request))
                .build();
    }

    @GetMapping
    @Operation(
            summary = "Get all products",
            description = "Retrieves a paginated list of all products. Supports filtering by name, category, price range, etc."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully",
                    content = @Content(schema = @Schema(implementation = PageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid filter parameters")
    })
    public com.example.productservice.dto.ApiResponses<PageResponse<ProductSummaryResponse>> getAll(
            @ModelAttribute ProductFilterRequest filter) {

        return com.example.productservice.dto.ApiResponses.<PageResponse<ProductSummaryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get products successfully")
                .data(productService.getAll(filter))
                .build();
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get product by ID",
            description = "Retrieves the full details of a product including all its variants."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ProductDetailResponse.class))),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public com.example.productservice.dto.ApiResponses<ProductDetailResponse> getById(
            @Parameter(description = "UUID of the product to retrieve", required = true)
            @PathVariable UUID id) {

        return com.example.productservice.dto.ApiResponses.<ProductDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get product successfully")
                .data(productService.getById(id))
                .build();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(
            summary = "Update a product",
            description = "Partially updates an existing product's information. Only **ADMIN** can perform this action."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product updated successfully",
                    content = @Content(schema = @Schema(implementation = ProductDetailResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public com.example.productservice.dto.ApiResponses<ProductDetailResponse> update(
            @Parameter(description = "UUID of the product to update", required = true)
            @PathVariable UUID id,
            @RequestBody @Valid ProductUpdateRequest request) {

        return com.example.productservice.dto.ApiResponses.<ProductDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Product updated successfully")
                .data(productService.update(request, id))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(
            summary = "Delete a product",
            description = "Soft or hard deletes a product by its ID. Only **ADMIN** can perform this action."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public com.example.productservice.dto.ApiResponses<Void> delete(
            @Parameter(description = "UUID of the product to delete", required = true)
            @PathVariable UUID id) {

        productService.delete(id);

        return com.example.productservice.dto.ApiResponses.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Product deleted successfully")
                .build();
    }

    // ==================== VARIANT ENDPOINTS ====================

    @PostMapping("/{productId}/variants")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(
            summary = "Add a variant to a product",
            description = "Adds a new variant (size, color, stock, price) to an existing product. Only **ADMIN** can perform this action."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Variant added successfully",
                    content = @Content(schema = @Schema(implementation = VariantResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid variant data"),
            @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public com.example.productservice.dto.ApiResponses<VariantResponse> addVariant(
            @Parameter(description = "UUID of the product to add variant to", required = true)
            @PathVariable UUID productId,
            @RequestBody @Valid VariantRequest request) {

        return com.example.productservice.dto.ApiResponses.<VariantResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Variant added successfully")
                .data(productService.addVariant(productId, request))
                .build();
    }

    @PatchMapping("/{productId}/variants/{variantId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(
            summary = "Update a product variant",
            description = "Partially updates a specific variant of a product (e.g., update stock or price). Only **ADMIN** can perform this action."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Variant updated successfully",
                    content = @Content(schema = @Schema(implementation = VariantResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid variant data"),
            @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required"),
            @ApiResponse(responseCode = "404", description = "Product or variant not found")
    })
    public com.example.productservice.dto.ApiResponses<VariantResponse> updateVariant(
            @Parameter(description = "UUID of the parent product", required = true)
            @PathVariable UUID productId,
            @Parameter(description = "UUID of the variant to update", required = true)
            @PathVariable UUID variantId,
            @RequestBody @Valid VariantUpdateRequest request) {

        return com.example.productservice.dto.ApiResponses.<VariantResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Variant updated successfully")
                .data(productService.updateVariant(productId, variantId, request))
                .build();
    }

    @DeleteMapping("/{productId}/variants/{variantId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(
            summary = "Delete a product variant",
            description = "Removes a specific variant from a product. Only **ADMIN** can perform this action."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Variant deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required"),
            @ApiResponse(responseCode = "404", description = "Product or variant not found")
    })
    public com.example.productservice.dto.ApiResponses<Void> deleteVariant(
            @Parameter(description = "UUID of the parent product", required = true)
            @PathVariable UUID productId,
            @Parameter(description = "UUID of the variant to delete", required = true)
            @PathVariable UUID variantId) {

        productService.deleteVariant(productId, variantId);

        return com.example.productservice.dto.ApiResponses.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Variant deleted successfully")
                .build();
    }

    @GetMapping("/{productId}/variants/{variantId}")

    @Operation(
            summary = "Get variant by ID",
            description = "Retrieves the details of a specific variant belonging to a product."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Variant retrieved successfully",
                    content = @Content(schema = @Schema(implementation = VariantResponse.class))),
            @ApiResponse(responseCode = "404", description = "Product or variant not found")
    })
    public com.example.productservice.dto.ApiResponses<VariantResponse> getVariantById(
            @Parameter(description = "UUID of the parent product", required = true)
            @PathVariable UUID productId,
            @Parameter(description = "UUID of the variant to retrieve", required = true)
            @PathVariable UUID variantId) {

        return com.example.productservice.dto.ApiResponses.<VariantResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get variant successfully")
                .data(productService.getVariantById(productId, variantId))
                .build();
    }


}
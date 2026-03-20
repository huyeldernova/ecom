package com.example.productservice.controller;

import com.example.productservice.dto.ApiResponses;
import com.example.productservice.dto.CategoryRequest;
import com.example.productservice.dto.CategoryResponse;
import com.example.productservice.dto.CategoryUpdateRequest;
import com.example.productservice.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Category", description = "API quản lý danh mục sản phẩm")
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "Tạo danh mục mới")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Request không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponses<CategoryResponse> create(
            @RequestBody @Valid CategoryRequest request) {
        return ApiResponses.<CategoryResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Category created successfully")
                .data(categoryService.create(request))
                .build();
    }

    @Operation(summary = "Lấy danh mục dạng cây")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thành công")
    })
    @GetMapping("/tree")
    // Public — không cần @PreAuthorize
    public ApiResponses<List<CategoryResponse>> getTree() {
        return ApiResponses.<List<CategoryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get category tree successfully")
                .data(categoryService.getTree())
                .build();
    }

    @Operation(summary = "Cập nhật danh mục")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy danh mục"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponses<CategoryResponse> update(
            @Parameter(description = "ID của danh mục") @PathVariable UUID id,
            @RequestBody @Valid CategoryUpdateRequest request) {
        return ApiResponses.<CategoryResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Category updated successfully")
                .data(categoryService.update(id, request))
                .build();
    }

    @Operation(summary = "Xóa danh mục")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy danh mục"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponses<Void> delete(
            @Parameter(description = "ID của danh mục") @PathVariable UUID id) {
        categoryService.delete(id);
        return ApiResponses.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Category deleted successfully")
                .build();
    }
}
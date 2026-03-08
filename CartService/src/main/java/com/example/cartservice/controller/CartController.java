package com.example.cartservice.controller;

import com.example.cartservice.dto.*;
import com.example.cartservice.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "APIs quản lý giỏ hàng")
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final CartService cartService;

    @Operation(
            summary = "Lấy giỏ hàng",
            description = "Trả về giỏ hàng hiện tại của user. Nếu chưa có cart thì trả về cart rỗng."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lấy cart thành công"),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực")
    })
    @GetMapping
    public com.example.cartservice.dto.ApiResponses<CartResponse> getCart(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        return com.example.cartservice.dto.ApiResponses.<CartResponse>builder()
                .code(200)
                .message("Get cart successfully")
                .data(cartService.getCart(getUserId(jwt)))
                .build();
    }

    @Operation(
            summary = "Thêm sản phẩm vào giỏ hàng",
            description = "Thêm một variant sản phẩm vào giỏ hàng. Nếu variant đã tồn tại thì cộng dồn quantity."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Thêm vào giỏ hàng thành công"),
            @ApiResponse(responseCode = "400", description = "Variant không hợp lệ hoặc hết hàng"),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
            @ApiResponse(responseCode = "410", description = "Giỏ hàng đã hết hạn (CART_EXPIRED)")
    })
    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public com.example.cartservice.dto.ApiResponses<CartResponse> addItem(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestBody @Valid AddItemRequest request) {
        return com.example.cartservice.dto.ApiResponses.<CartResponse>builder()
                .code(201)
                .message("Item added to cart successfully")
                .data(cartService.addItem(getUserId(jwt), request))
                .build();
    }

    @Operation(
            summary = "Cập nhật số lượng sản phẩm",
            description = "Cập nhật quantity của một item trong giỏ hàng. Nếu quantity = 0 thì item sẽ bị xóa."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy item trong giỏ hàng")
    })
    @PatchMapping("/items/{id}/quantity")
    public com.example.cartservice.dto.ApiResponses<CartResponse> updateQuantity(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "ID của cart item", required = true) @PathVariable UUID id,
            @RequestBody @Valid UpdateQuantityRequest request) {
        return com.example.cartservice.dto.ApiResponses.<CartResponse>builder()
                .code(200)
                .message("Quantity updated successfully")
                .data(cartService.updateQuantity(getUserId(jwt), id, request))
                .build();
    }

    @Operation(
            summary = "Đổi variant sản phẩm",
            description = "Thay đổi variant (size/màu) của một item trong giỏ hàng. Snapshot price sẽ được cập nhật theo variant mới."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Đổi variant thành công"),
            @ApiResponse(responseCode = "400", description = "Variant mới không hợp lệ hoặc hết hàng"),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy item trong giỏ hàng")
    })
    @PatchMapping("/items/{id}/variant")
    public com.example.cartservice.dto.ApiResponses<CartResponse> updateVariant(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "ID của cart item", required = true) @PathVariable UUID id,
            @RequestBody @Valid UpdateVariantRequest request) {
        return com.example.cartservice.dto.ApiResponses.<CartResponse>builder()
                .code(200)
                .message("Variant updated successfully")
                .data(cartService.updateVariant(getUserId(jwt), id, request))
                .build();
    }

    @Operation(
            summary = "Xóa một sản phẩm khỏi giỏ hàng",
            description = "Xóa một item cụ thể ra khỏi giỏ hàng theo itemId."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Xóa item thành công"),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy item trong giỏ hàng")
    })
    @DeleteMapping("/items/{id}")
    public com.example.cartservice.dto.ApiResponses<Void> removeItem(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "ID của cart item cần xóa", required = true) @PathVariable UUID id) {
        cartService.removeItem(getUserId(jwt), id);
        return com.example.cartservice.dto.ApiResponses.<Void>builder()
                .code(200)
                .message("Item removed successfully")
                .build();
    }

    @Operation(
            summary = "Xóa toàn bộ sản phẩm trong giỏ hàng",
            description = "Xóa tất cả items trong cart nhưng vẫn giữ lại Cart."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Xóa toàn bộ items thành công"),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy giỏ hàng")
    })
    @DeleteMapping("/items")
    public com.example.cartservice.dto.ApiResponses<Void> clearCart(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        cartService.clearCart(getUserId(jwt));
        return com.example.cartservice.dto.ApiResponses.<Void>builder()
                .code(200)
                .message("Cart cleared successfully")
                .build();
    }

    @Operation(
            summary = "Xóa giỏ hàng",
            description = "Xóa toàn bộ giỏ hàng bao gồm tất cả items bên trong."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Xóa giỏ hàng thành công"),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy giỏ hàng")
    })
    @DeleteMapping
    public com.example.cartservice.dto.ApiResponses<Void> deleteCart(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        cartService.deleteCart(getUserId(jwt));
        return com.example.cartservice.dto.ApiResponses.<Void>builder()
                .code(200)
                .message("Cart deleted successfully")
                .build();
    }

    private UUID getUserId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
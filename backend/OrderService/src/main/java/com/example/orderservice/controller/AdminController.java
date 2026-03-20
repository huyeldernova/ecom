package com.example.orderservice.controller;

import com.example.orderservice.dto.ApiResponses;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.dto.PageResponse;
import com.example.orderservice.dto.UpdateOrderStatusRequest;
import com.example.orderservice.entity.OrderStatus;
import com.example.orderservice.exception.AppException;
import com.example.orderservice.exception.ErrorCode;
import com.example.orderservice.service.OrderService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order", description = "APIs quản lý đơn hàng")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {
    private static final String INTERNAL_API_KEY = "super-secret-internal-key-123";

    private final OrderService orderService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/admin")
    public ApiResponses<PageResponse<OrderResponse>> getAllOrders(@RequestParam(required = false) OrderStatus status, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10")  int size){
        return ApiResponses.<PageResponse<OrderResponse>>builder()
                .code(200)
                .message("get order success")
                .data(orderService.getAllOrders(status, page, size))
                .build();
    }

    @PatchMapping("/internal/{id}/status")
    public ApiResponses<Void> updateOrderStatus(@PathVariable("id") UUID orderId,
                                                @RequestHeader("X-Internal-Key") String apiKey,
                                                @RequestBody UpdateOrderStatusRequest request){

        if (!INTERNAL_API_KEY.equals(apiKey)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        orderService.updateOrderStatus(orderId, request);

        return ApiResponses.<Void>builder()
                .code(200)
                .message("Order status updated successfully")
                .build();
    }

    @GetMapping("/internal/{orderId}")
    public ApiResponses<OrderResponse> getOrderInternal(@RequestHeader("X-Internal-Key") String apiKey, @PathVariable UUID orderId) {

        if (!INTERNAL_API_KEY.equals(apiKey)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return ApiResponses.<OrderResponse>builder()
                .code(1000)
                .message("get order success")
                .data(orderService.getOrderById(orderId))
                .build();

    }
}

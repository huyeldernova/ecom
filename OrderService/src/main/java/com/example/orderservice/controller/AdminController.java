package com.example.orderservice.controller;

import com.example.orderservice.dto.ApiResponses;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.dto.PageResponse;
import com.example.orderservice.entity.OrderStatus;
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

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/{id}/status")
    public ApiResponses<OrderResponse> updateOrderStatus(@PathVariable("id") UUID orderId,@RequestParam(required = false) OrderStatus status){
        return ApiResponses.<OrderResponse>builder()
                .code(200)
                .message("Order status updated successfully")
                .data(orderService.updateOrderStatus(orderId, status))
                .build();
    }
}

package com.example.orderservice.controller;

import com.example.orderservice.dto.ApiResponses;
import com.example.orderservice.dto.CreateOrderRequest;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.dto.PageResponse;
import com.example.orderservice.service.OrderService;
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
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order", description = "APIs quản lý đơn hàng")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping()
    public ApiResponses<OrderResponse> createOrder(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateOrderRequest request){
        UUID userId = UUID.fromString(jwt.getSubject());
        String token = "Bearer " + jwt.getTokenValue();
        return ApiResponses.<OrderResponse>builder()
                .code(200)
                .message("create order success")
                .data(orderService.createOrder(request, userId, token))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponses<OrderResponse> getOrder(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id){
        UUID userId = UUID.fromString(jwt.getSubject());

        return ApiResponses.<OrderResponse>builder()
                .code(200)
                .message("get order success")
                .data(orderService.getOrder(id, userId))
                .build();
    }

    @GetMapping
    public ApiResponses<PageResponse<OrderResponse>> getOrders(@AuthenticationPrincipal Jwt jwt, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        UUID userId = UUID.fromString(jwt.getSubject());

        return ApiResponses.<PageResponse<OrderResponse>>builder()
                .code(200)
                .message("get order success")
                .data(orderService.getOrders(userId, page, size))
                .build();
    }

    @PostMapping("/{id}/cancel")
    public ApiResponses<Void> cancelOrder(@AuthenticationPrincipal Jwt jwt,  @PathVariable("id") UUID orderId){

        UUID userId = UUID.fromString(jwt.getSubject());
        orderService.cancelOrder(orderId, userId);

        return ApiResponses.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Cancel order success")
                .build();
    }

    @PostMapping("/{id}/checkout")
    public ApiResponses<OrderResponse> checkout(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {

        UUID userId = UUID.fromString(jwt.getSubject());
        String token = "Bearer " + jwt.getTokenValue();
        String email = jwt.getClaimAsString("email");


        return ApiResponses.<OrderResponse>builder()
                .code(200)
                .message("Checkout success")
                .data(orderService.checkout(id, userId, token, email))
                .build();
    }

}


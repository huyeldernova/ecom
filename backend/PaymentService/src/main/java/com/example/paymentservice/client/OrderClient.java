package com.example.paymentservice.client;

import com.example.paymentservice.dto.ApiResponses;
import com.example.paymentservice.dto.client.order.OrderResponse;
import com.example.paymentservice.dto.client.order.UpdateOrderStatusRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PatchExchange;

import java.util.UUID;

@HttpExchange(url = "http://localhost:8083/order")
public interface OrderClient {
    @PatchExchange("/api/v1/orders/internal/{id}/status")
    ApiResponses<Void> updateOrderStatus(@PathVariable("id") UUID orderId, @RequestHeader("X-Internal-Key") String apiKey, @RequestBody UpdateOrderStatusRequest request);

    @GetExchange("/api/v1/orders/internal/{orderId}")
    ApiResponses<OrderResponse> getOrder(
            @PathVariable("orderId") UUID orderId,
            @RequestHeader("X-Internal-Key") String apiKey
    );

    }

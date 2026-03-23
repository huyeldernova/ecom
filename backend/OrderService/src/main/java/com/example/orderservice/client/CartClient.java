package com.example.orderservice.client;

import com.example.orderservice.dto.ApiResponses;
import com.example.orderservice.dto.client.cart.CartResponse;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.service.annotation.DeleteExchange;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

@HttpExchange(url = "http://localhost:8083/cart")
public interface CartClient {
    @GetExchange("/api/v1/cart")
    ApiResponses<CartResponse> getCart(@RequestHeader("Authorization") String token);

    @DeleteExchange("/api/v1/cart/items")
    void clearCart(@RequestHeader("Authorization") String token);
}

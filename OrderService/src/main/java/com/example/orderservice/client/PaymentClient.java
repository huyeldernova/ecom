package com.example.orderservice.client;


import com.example.orderservice.dto.ApiResponses;
import com.example.orderservice.dto.client.payment.PaymentRequest;
import com.example.orderservice.dto.client.payment.PaymentResponse;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

@HttpExchange(url = "http://localhost:8085/payment")
public interface PaymentClient {
    @PostExchange("/api/payment/create-intent")
    ApiResponses<PaymentResponse> createPaymentIntent(@RequestHeader("Authorization") String token, @RequestBody PaymentRequest request);


}

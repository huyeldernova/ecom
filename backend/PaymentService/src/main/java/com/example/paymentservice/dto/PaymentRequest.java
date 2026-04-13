package com.example.paymentservice.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class PaymentRequest {
    private UUID orderId;
    private String email;
    private Long amount;
    private String currency;
}
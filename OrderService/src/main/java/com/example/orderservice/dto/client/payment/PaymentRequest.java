package com.example.orderservice.dto.client.payment;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PaymentRequest {
    private UUID orderId;
    private Long amount;
    private String currency;
}

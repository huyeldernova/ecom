package com.example.orderservice.dto.client.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private String paymentIntentId;
    private String clientSecret;
    private String status;
    private Long amount;
    private String currency;
}

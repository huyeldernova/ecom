package com.example.event;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentFailedEvent {
    private String orderId;
    private String userId;
    private String email;
    private BigDecimal amount;
    private String currency;
}

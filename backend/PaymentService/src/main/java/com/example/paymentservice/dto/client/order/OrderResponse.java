package com.example.paymentservice.dto.client.order;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private UUID id;

    private UUID userId;

    private OrderStatus status;

    private BigDecimal totalAmount;

    private String clientSecret;

    private ShippingAddressDto shippingAddress;

    private String note;

    private List<OrderItemResponse> orderItems;

    private LocalDateTime createdAt;
}
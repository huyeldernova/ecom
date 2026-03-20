package com.example.paymentservice.dto.client.order;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    private UUID id;

    private UUID productVariantId;

    // snapshot
    private String productName;

    // snapshot
    private String variantName;

    private Integer quantity;

    // snapshot price
    private BigDecimal unitPrice;

    private BigDecimal subtotal;
}

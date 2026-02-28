package com.example.cartservice.dto;

import com.example.cartservice.entity.enums.CartStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CartResponse {
    private UUID userId;
    private CartStatus status;
    private BigDecimal totalPrice;
    private Integer totalItems;
    private LocalDateTime expiredAt;
    List<CartItemResponse> cartItems;
}

package com.example.orderservice.dto;

import com.example.orderservice.entity.OrderStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateOrderStatusRequest {
    private OrderStatus status;

}

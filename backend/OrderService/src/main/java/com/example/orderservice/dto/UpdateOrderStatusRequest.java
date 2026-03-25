package com.example.orderservice.dto;

import com.example.orderservice.entity.OrderStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateOrderStatusRequest {
    @JsonProperty("status")
    private OrderStatus status;

}

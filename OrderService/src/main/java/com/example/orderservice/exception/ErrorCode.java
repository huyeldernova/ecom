package com.example.orderservice.exception;


import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    INTERNAL_SERVER_ERROR(5000, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),

    ORDER_NOT_FOUND(1001, "Order not found with given ID", HttpStatus.NOT_FOUND),

    ORDER_CANNOT_BE_CANCELLED(
            1002,
            "Order cannot be cancelled because it is already SHIPPING or DELIVERED",
            HttpStatus.CONFLICT
    ),

    INVALID_ORDER_STATUS_TRANSITION(
            1003,
            "Invalid order status transition according to state machine",
            HttpStatus.CONFLICT
    ),

    CART_EMPTY(
            1004,
            "Cart is empty. Cannot create order",
            HttpStatus.BAD_REQUEST
    ),

    INVALID_PRODUCT_VARIANT(
            1005,
            "Product variant is inactive or out of stock at ordering time",
            HttpStatus.BAD_REQUEST
    ),

    CART_SERVICE_UNAVAILABLE(
            1006,
            "Cannot connect to Cart Service",
            HttpStatus.SERVICE_UNAVAILABLE
    ),

    PAYMENT_SERVICE_UNAVAILABLE(
            1007,
            "Cannot connect to Payment Service",
            HttpStatus.SERVICE_UNAVAILABLE
    ),
    ORDER_ALREADY_PENDING(
    1008,
            "User already has a pending order",
    HttpStatus.CONFLICT
    ),

    ACCESS_DENIED(403, "access denied", HttpStatus.FORBIDDEN),

    UNAUTHORIZED(401, "unauthorized", HttpStatus.UNAUTHORIZED),

    OUT_OF_STOCK(401, "out of stock",HttpStatus.BAD_REQUEST)

    ;

    private final int code;
    private final String message;
    private final HttpStatus status;
}
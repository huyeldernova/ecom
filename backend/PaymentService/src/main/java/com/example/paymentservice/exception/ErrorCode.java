package com.example.paymentservice.exception;


import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    INTERNAL_SERVER_ERROR(5000, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),

    PAYMENT_NOT_FOUND(1001, "payment not found with given ID", HttpStatus.NOT_FOUND),

    PAYMENT_SERVICE_UNAVAILABLE(
            1007,
            "Cannot connect to Payment Service",
            HttpStatus.SERVICE_UNAVAILABLE
    ),

    INVALID_WEBHOOK_SIGNATURE(400, "invalid webhook signature", HttpStatus.BAD_REQUEST),


    ACCESS_DENIED(403, "access denied", HttpStatus.FORBIDDEN),

    UNAUTHORIZED(401, "unauthorized", HttpStatus.UNAUTHORIZED),

    ORDER_SERVICE_UNAVAILABLE(400, "order service unavailable", HttpStatus.SERVICE_UNAVAILABLE),

    INVENTORY_SERVICE_UNAVAILABLE(400, "inventory service unvailable", HttpStatus.SERVICE_UNAVAILABLE),
    ;

    private final int code;
    private final String message;
    private final HttpStatus status;
}
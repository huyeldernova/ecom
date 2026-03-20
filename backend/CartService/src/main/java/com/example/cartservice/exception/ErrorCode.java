package com.example.cartservice.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INTERNAL_SERVER_ERROR(500, "error",  HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED(401, "unauthorized", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(403, "access denied", HttpStatus.FORBIDDEN),

    CART_NOT_FOUND(400, "cart not found", HttpStatus.BAD_REQUEST),
    CART_EXPIRED(400, "cart expired", HttpStatus.BAD_REQUEST),

    CART_ITEM_NOT_FOUND(400, "cart item not found", HttpStatus.BAD_REQUEST),
    INVALID_QUANTITY(400, "invalid quantity", HttpStatus.BAD_REQUEST),

    INVALID_PRODUCT_VARIANT(400, "invalid product variant", HttpStatus.BAD_REQUEST)

    ;

    private final int code;
    private final String message;
    private final HttpStatus status;



}
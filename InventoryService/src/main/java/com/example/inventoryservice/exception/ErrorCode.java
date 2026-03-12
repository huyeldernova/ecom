package com.example.inventoryservice.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    INTERNAL_SERVER_ERROR(500, "Error", HttpStatus.INTERNAL_SERVER_ERROR),

    UNAUTHORIZED(401, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED),

    ACCESS_DENIED(403, "ACCESS_DENIED", HttpStatus.FORBIDDEN),

    INVENTORY_NOT_FOUND(404, "Inventory not found for productVariantId", HttpStatus.NOT_FOUND),

    INVENTORY_ALREADY_EXISTS(409, "Inventory already exists for this productVariantId", HttpStatus.CONFLICT),

    OUT_OF_STOCK(422, "Not enough stock available", HttpStatus.UNPROCESSABLE_ENTITY),

    INVALID_QUANTITY(400, "Quantity must be greater than 0", HttpStatus.BAD_REQUEST),

    CONFLICT(400, "Conflict", HttpStatus.CONFLICT),

    INVENTORY_SERVICE_UNAVAILABLE(503, "Inventory service unavailable", HttpStatus.SERVICE_UNAVAILABLE);

    private final int code;
    private final String message;
    private final HttpStatus status;

}
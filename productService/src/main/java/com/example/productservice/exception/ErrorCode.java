package com.example.productservice.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INTERNAL_SERVER_ERROR(500, "Error",  HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED(401, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED),
    CATEGORY_NOT_FOUND(404, "Category not found", HttpStatus.NOT_FOUND),
    INVALID_INPUT(401, "invalid input", HttpStatus.BAD_REQUEST),
    ACCESS_DENIED(500, "ACCESS_DENIED", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_FOUND(404, "Product not found", HttpStatus.NOT_FOUND),
    PRODUCT_ALREADY_EXISTS(400, "Product already exists", HttpStatus.BAD_REQUEST),
    SKU_ALREADY_EXISTS(400, "SKU already exists", HttpStatus.BAD_REQUEST),
    VARIANT_NOT_FOUND(400, "variant not found", HttpStatus.NOT_FOUND)





    ;

    private final int code;
    private final String message;
    private final HttpStatus status;



}
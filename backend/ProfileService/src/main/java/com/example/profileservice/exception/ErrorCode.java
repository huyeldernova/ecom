package com.example.profileservice.exception;


import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    INTERNAL_SERVER_ERROR(5000, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),

    ACCESS_DENIED(403, "access denied", HttpStatus.FORBIDDEN),

    UNAUTHORIZED(401, "unauthorized", HttpStatus.UNAUTHORIZED),

    PROFILE_NOT_FOUND(400, "profile not found", HttpStatus.NOT_FOUND),

    ADDRESS_NOT_FOUND(400, "address not found", HttpStatus.NOT_FOUND),

    WISHLIST_ALREADY_EXISTS(400,"wishlist already exists", HttpStatus.BAD_REQUEST),
    WISHLIST_NOT_FOUND(400, "wishlist not found", HttpStatus.NOT_FOUND),




    ;

    private final int code;
    private final String message;
    private final HttpStatus status;
}
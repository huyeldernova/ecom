package com.example.notificationservice.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INTERNAL_SERVER_ERROR(500, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(403, "Access denied", HttpStatus.FORBIDDEN),
    NOTIFICATION_NOT_FOUND(404, "Notification not found", HttpStatus.NOT_FOUND),
    NOTIFICATION_ACCESS_DENIED(403, "You don't have permission to access this notification", HttpStatus.FORBIDDEN)
    ;



    private final int code;
    private final String message;
    private final HttpStatus status;



}
package com.example.notificationservice.exception;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private int code;
    private String message;
    private String error;
    private Date timestamp;
    private String path;
}


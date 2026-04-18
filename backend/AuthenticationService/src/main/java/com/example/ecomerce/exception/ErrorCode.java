package com.example.ecomerce.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INTERNAL_SERVER_ERROR(500, "Error",  HttpStatus.INTERNAL_SERVER_ERROR),

    USER_EXISTED(400, "User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(400, "User not found", HttpStatus.BAD_REQUEST),

    PROFILE_CREATION_FAILED(404, "Profile not found", HttpStatus.NOT_FOUND),


    TOKEN_INVALID(401, "Token is invalid", HttpStatus.UNAUTHORIZED),
    JWT_TOKEN_INVALID(401, "JWT token is invalid", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(401, "Token has expired", HttpStatus.UNAUTHORIZED),
    TOKEN_HAS_BEEN_BLACKLISTED(401, "Token has been blacklisted", HttpStatus.UNAUTHORIZED),

    USER_ALDREADY_SUCCESS(401,"user aldreaddy success", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(500, "ACCESS_DENIED", HttpStatus.BAD_REQUEST),

    // ── Email Verification
    EMAIL_NOT_FOUND(400, "Email không tồn tại", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_VERIFIED(400, "Email đã được xác thực", HttpStatus.BAD_REQUEST),
    ACCOUNT_NOT_VERIFIED(403, "Tài khoản chưa xác thực email", HttpStatus.FORBIDDEN),
    VERIFICATION_TOKEN_NOT_FOUND(400, "OTP không hợp lệ", HttpStatus.BAD_REQUEST),
    VERIFICATION_TOKEN_EXPIRED(400, "OTP đã hết hạn", HttpStatus.BAD_REQUEST),
    VERIFICATION_TOKEN_USED(400, "OTP đã được sử dụng", HttpStatus.BAD_REQUEST),

    // ── Password Reset
    RESET_TOKEN_NOT_FOUND(400, "OTP không hợp lệ", HttpStatus.BAD_REQUEST),
    RESET_TOKEN_EXPIRED(400, "OTP reset đã hết hạn", HttpStatus.BAD_REQUEST),

    // ── Change Password
    WRONG_OLD_PASSWORD(400, "Mật khẩu cũ không đúng", HttpStatus.BAD_REQUEST),
    NEW_PASSWORD_SAME_AS_OLD(400, "Mật khẩu mới không được trùng mật khẩu cũ", HttpStatus.BAD_REQUEST),

    ;

    private final int code;
    private final String message;
    private final HttpStatus status;



}
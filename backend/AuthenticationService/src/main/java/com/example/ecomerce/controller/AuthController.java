package com.example.ecomerce.controller;

import com.example.ecomerce.dto.IntroSpectResponse;
import com.example.ecomerce.dto.reponse.*;
import com.example.ecomerce.dto.request.*;
import com.example.ecomerce.service.AuthService;
import com.example.ecomerce.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "APIs xác thực và quản lý mật khẩu")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    // ─── Đăng nhập ───────────────────────────────────────────────────────────
    @PostMapping("/login")
    @Operation(
            summary = "Đăng nhập",
            description = "Trả về accessToken và refreshToken. Tài khoản chưa verify email sẽ bị chặn."
    )
    public ApiResponses<LoginResponse> login(
            @RequestBody @Valid LoginRequest request) throws Exception {

        LoginResponse response = authService.login(request);
        return ApiResponses.<LoginResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đăng nhập thành công")
                .data(response)
                .build();
    }

    // ─── Đăng xuất ───────────────────────────────────────────────────────────
    @PostMapping("/logout")
    @Operation(
            summary = "Đăng xuất",
            description = "Blacklist accessToken hiện tại vào Redis."
    )
    public ApiResponses<Void> logout(
            @RequestHeader("Authorization") String authHeader) throws ParseException {

        String token = authHeader.substring(7);
        authService.logout(token);
        return ApiResponses.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Đăng xuất thành công")
                .build();
    }

    // ─── Introspect token ─────────────────────────────────────────────────────
    @PostMapping("/introspect")
    @Operation(summary = "Kiểm tra token hợp lệ không")
    public ApiResponses<IntroSpectResponse> introspect(
            @RequestBody IntroSpectRequest request) {

        IntroSpectResponse response = authService.introspect(request);
        return ApiResponses.<IntroSpectResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Introspect successful")
                .data(response)
                .build();
    }

    // ─── Quên mật khẩu → gửi OTP ─────────────────────────────────────────────
    @PostMapping("/forgot-password")
    @Operation(
            summary = "Gửi OTP đặt lại mật khẩu",
            description = "Gửi OTP 6 số vào email. Luôn trả 200 dù email tồn tại hay không để tránh User Enumeration Attack."
    )
    public ApiResponses<Void> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest request) {

        passwordResetService.sendResetOtp(request.getEmail());
        return ApiResponses.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Nếu email hợp lệ, bạn sẽ nhận được mã OTP trong vài phút.")
                .build();
    }

    // ─── Đặt lại mật khẩu bằng OTP ───────────────────────────────────────────
    @PostMapping("/reset-password")
    @Operation(
            summary = "Đặt lại mật khẩu",
            description = "Xác minh OTP từ Redis rồi cập nhật mật khẩu mới."
    )
    public ApiResponses<Void> resetPassword(
            @RequestBody @Valid ResetPasswordRequest request) {

        passwordResetService.resetPassword(
                request.getEmail(),
                request.getOtp(),
                request.getNewPassword()
        );
        return ApiResponses.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.")
                .build();
    }
}
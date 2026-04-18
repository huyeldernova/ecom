package com.example.ecomerce.controller;

import com.example.ecomerce.dto.reponse.ApiResponses;
import com.example.ecomerce.dto.reponse.RegisterResponse;
import com.example.ecomerce.dto.request.*;
import com.example.ecomerce.service.EmailVerificationService;
import com.example.ecomerce.service.PasswordResetService;
import com.example.ecomerce.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "APIs quản lý user và xác thực email")
public class UserController {

    private final UserService userService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;

    // ─── Đăng ký tài khoản ───────────────────────────────────────────────────
    @PostMapping("/register")
    @Operation(
            summary = "Đăng ký tài khoản mới",
            description = "Tạo tài khoản. Sau khi đăng ký, OTP sẽ được gửi vào email để xác thực."
    )
    public ApiResponses<RegisterResponse> register(
            @RequestBody @Valid RegisterRequest request) {

        RegisterResponse response = userService.register(request);
        return ApiResponses.<RegisterResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.")
                .data(response)
                .build();
    }

    // ─── Xác thực email bằng OTP ─────────────────────────────────────────────
    @PostMapping("/verify-email")
    @Operation(
            summary = "Xác thực email bằng OTP",
            description = "User nhập OTP 6 số nhận được qua email để kích hoạt tài khoản."
    )
    public ApiResponses<Void> verifyEmail(
            @RequestBody @Valid VerifyEmailRequest request) {

        emailVerificationService.verifyEmail(request.getOtp());
        return ApiResponses.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xác thực email thành công. Bạn có thể đăng nhập ngay.")
                .build();
    }

    // ─── Gửi lại OTP ─────────────────────────────────────────────────────────
    @PostMapping("/resend-verification")
    @Operation(
            summary = "Gửi lại OTP xác thực email",
            description = "Xóa OTP cũ và tạo OTP mới, gửi lại vào email. Dùng khi OTP hết hạn."
    )
    public ApiResponses<Void> resendVerification(
            @RequestBody @Valid ResendVerificationRequest request) {

        emailVerificationService.resendVerification(request.getEmail());
        return ApiResponses.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("OTP đã được gửi lại. Vui lòng kiểm tra email.")
                .build();
    }

    // ─── Đổi mật khẩu (user đã login) ────────────────────────────────────────
    @PostMapping("/change-password")
    @Operation(
            summary = "Đổi mật khẩu",
            description = "Yêu cầu JWT. User nhập mật khẩu cũ và mật khẩu mới."
    )
    public ApiResponses<Void> changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody @Valid ChangePasswordRequest request) {

        String email = jwt.getSubject();
        passwordResetService.changePassword(
                email,
                request.getOldPassword(),
                request.getNewPassword()
        );
        return ApiResponses.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Đổi mật khẩu thành công.")
                .build();
    }

    // ─── Assign role (internal) ───────────────────────────────────────────────
    @PostMapping("/{userId}/roles")
    public ApiResponses<Void> assignRole(
            @PathVariable UUID userId,
            @RequestParam String roleName) {

        userService.assignRole(userId, roleName);
        return ApiResponses.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Role assigned successfully")
                .build();
    }
}
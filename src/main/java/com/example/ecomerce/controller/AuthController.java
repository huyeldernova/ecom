package com.example.ecomerce.controller;

import com.example.ecomerce.dto.reponse.ApiResponses;
import com.example.ecomerce.dto.reponse.LoginResponse;
import com.example.ecomerce.dto.request.LoginRequest;
import com.example.ecomerce.exception.ErrorResponse;
import com.example.ecomerce.service.AuthService;
import com.nimbusds.jose.JOSEException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API xác thực người dùng")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(
            summary = "Đăng nhập",
            description = "Xác thực email + password, trả về accessToken và refreshToken"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Đăng nhập thành công",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Sai email hoặc password",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Tài khoản không tồn tại"
            )
    })
    public ApiResponses<LoginResponse> login(@RequestBody @Valid LoginRequest request) throws JOSEException {

        LoginResponse loginResponse = authService.login(request);
        return ApiResponses.<LoginResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Login Success")
                .data(loginResponse)
                .build();
    }
}

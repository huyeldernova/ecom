package com.example.ecomerce.controller;

import com.example.ecomerce.dto.reponse.ApiResponses;
import com.example.ecomerce.dto.reponse.RegisterResponse;
import com.example.ecomerce.dto.request.RegisterRequest;
import com.example.ecomerce.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user authentication")  //
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    @Operation(
            summary = "Register new user",
            description = "Create a new user account with email and password"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "User registered successfully",
                    content = @Content(schema = @Schema(implementation = RegisterResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Email already exists or validation failed",
                    content = @Content
            )
    })
    public ApiResponses<RegisterResponse> register(@RequestBody @Valid RegisterRequest request){
        RegisterResponse registerResponse = userService.register(request);
        return ApiResponses.<RegisterResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("register success")
                .data(registerResponse)
                .build();
    }

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

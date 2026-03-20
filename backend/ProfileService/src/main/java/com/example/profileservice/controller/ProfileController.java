package com.example.profileservice.controller;

import com.example.profileservice.dto.ApiResponses;
import com.example.profileservice.dto.ProfileResponse;
import com.example.profileservice.dto.UpdateProfileRequest;
import com.example.profileservice.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ApiResponses<ProfileResponse> getProfile(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ApiResponses.<ProfileResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get profile successfully")
                .data(profileService.getProfile(userId))
                .build();
    }

    @PatchMapping("/me")
    public ApiResponses<ProfileResponse> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UpdateProfileRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ApiResponses.<ProfileResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Update profile successfully")
                .data(profileService.updateProfile(userId, request))
                .build();
    }
}
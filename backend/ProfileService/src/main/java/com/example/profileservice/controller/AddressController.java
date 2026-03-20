package com.example.profileservice.controller;

import com.example.profileservice.dto.AddressRequest;
import com.example.profileservice.dto.AddressResponse;
import com.example.profileservice.dto.ApiResponses;

import com.example.profileservice.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    private UUID extractUserId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    // Lấy tất cả address
    @GetMapping
    public ApiResponses<List<AddressResponse>> getAddresses(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = extractUserId(jwt);

        List<AddressResponse> addresses = addressService.getAddresses(userId);

        return ApiResponses.<List<AddressResponse>>builder()
                .code(200)
                .message("Addresses retrieved successfully")
                .data(addresses)
                .build();
    }

    // Thêm address
    @PostMapping
    public ApiResponses<AddressResponse> addAddress(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody AddressRequest request
    ) {
        UUID userId = extractUserId(jwt);

        AddressResponse response = addressService.addAddress(userId, request);

        return ApiResponses.<AddressResponse>builder()
                .code(201)
                .message("Address created successfully")
                .data(response)
                .build();
    }

    // Update address
    @PatchMapping ("/{addressId}")
    public ApiResponses<AddressResponse> updateAddress(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID addressId,
            @RequestBody AddressRequest request
    ) {
        UUID userId = extractUserId(jwt);

        AddressResponse response = addressService.updateAddress(userId, addressId, request);

        return ApiResponses.<AddressResponse>builder()
                .code(200)
                .message("Address updated successfully")
                .data(response)
                .build();
    }

    // Delete address
    @DeleteMapping("/{addressId}")
    public ApiResponses<Void> deleteAddress(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID addressId
    ) {
        UUID userId = extractUserId(jwt);

        addressService.deleteAddress(userId, addressId);

        return ApiResponses.<Void>builder()
                .code(200)
                .message("Address deleted successfully")
                .build();
    }

    // Set default address
    @PatchMapping("/{addressId}/default")
    public ApiResponses<Void> setDefaultAddress(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID addressId
    ) {
        UUID userId = extractUserId(jwt);

        addressService.setDefault(userId, addressId);

        return ApiResponses.<Void>builder()
                .code(200)
                .message("Default address updated")
                .build();
    }
}
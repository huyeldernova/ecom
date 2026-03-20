package com.example.profileservice.controller;

import com.example.profileservice.dto.ApiResponses;
import com.example.profileservice.dto.WishlistResponse;
import com.example.profileservice.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    private UUID extractUserId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    @GetMapping
    public ApiResponses<List<WishlistResponse>> getWishlist(
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = extractUserId(jwt);

        List<WishlistResponse> wishlist = wishlistService.getWishlist(userId);

        return ApiResponses.<List<WishlistResponse>>builder()
                .code(200)
                .message("Wishlist retrieved successfully")
                .data(wishlist)
                .build();
    }

    @PostMapping("/{productId}")
    public ApiResponses<WishlistResponse> addToWishlist(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID productId
    ) {
        UUID userId = extractUserId(jwt);

        WishlistResponse response = wishlistService.addToWishlist(userId, productId);

        return ApiResponses.<WishlistResponse>builder()
                .code(201)
                .message("Product added to wishlist")
                .data(response)
                .build();
    }

    @DeleteMapping("/{productId}")
    public ApiResponses<Void> removeFromWishlist(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID productId
    ) {
        UUID userId = extractUserId(jwt);

        wishlistService.removeFromWishlist(userId, productId);

        return ApiResponses.<Void>builder()
                .code(200)
                .message("Product removed from wishlist")
                .build();
    }
}
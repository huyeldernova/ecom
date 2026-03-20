package com.example.profileservice.service;

import com.example.profileservice.dto.WishlistResponse;
import com.example.profileservice.entity.UserProfile;
import com.example.profileservice.entity.Wishlist;
import com.example.profileservice.exception.AppException;
import com.example.profileservice.exception.ErrorCode;
import com.example.profileservice.repository.UserProfileRepository;
import com.example.profileservice.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        return wishlistRepository.findAllByProfileId(profile.getId())
                .stream()
                .map(w -> WishlistResponse.builder()
                        .id(w.getId())
                        .productId(w.getProductId())
                        .createdAt(w.getCreateAt())
                        .build())
                .toList();
    }

    @Transactional
    public WishlistResponse addToWishlist(UUID userId, UUID productId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        if (wishlistRepository.existsByProfileIdAndProductId(profile.getId(), productId)) {
            throw new AppException(ErrorCode.WISHLIST_ALREADY_EXISTS);
        }

        Wishlist wishlist = Wishlist.builder()
                .profileId(profile.getId())
                .productId(productId)
                .build();

        Wishlist saved = wishlistRepository.save(wishlist);

        return WishlistResponse.builder()
                .id(saved.getId())
                .productId(saved.getProductId())
                .createdAt(saved.getCreateAt())
                .build();
    }

    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        if (!wishlistRepository.existsByProfileIdAndProductId(profile.getId(), productId)) {
            throw new AppException(ErrorCode.WISHLIST_NOT_FOUND);
        }

        wishlistRepository.deleteByProfileIdAndProductId(profile.getId(), productId);
    }
}
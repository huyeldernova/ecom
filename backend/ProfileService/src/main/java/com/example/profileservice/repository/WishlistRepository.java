package com.example.profileservice.repository;

import com.example.profileservice.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {
    List<Wishlist> findAllByProfileId(UUID profileId);
    boolean existsByProfileIdAndProductId(UUID profileId, UUID productId);
    void deleteByProfileIdAndProductId(UUID profileId, UUID productId);
}
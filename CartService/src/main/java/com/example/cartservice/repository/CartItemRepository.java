package com.example.cartservice.repository;

import com.example.cartservice.entity.Cart;
import com.example.cartservice.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    Optional<CartItem> findByCartAndProductVariantId(Cart cart, UUID productVariantId);

    void deleteByCart(Cart cart);

    @Query("SELECT ci FROM CartItem ci JOIN ci.cart c WHERE ci.id = :itemId AND c.userId = userId")
    Optional<CartItem> findBydIdAndUserId(@Param("itemId")UUID itemId, @Param("userId") UUID userId);

}



package com.example.cartservice.repository;

import com.example.cartservice.entity.Cart;
import com.example.cartservice.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    Optional<CartItem>findByCartAndProductVariantId(Cart cart, UUID productVariantId);
    void deleteByCart(Cart cart);
}

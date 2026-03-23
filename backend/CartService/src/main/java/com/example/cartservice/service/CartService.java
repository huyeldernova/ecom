package com.example.cartservice.service;

import com.example.cartservice.client.InventoryClient;
import com.example.cartservice.client.ProductClient;
import com.example.cartservice.dto.*;
import com.example.cartservice.dto.client.InventoryResponse;
import com.example.cartservice.dto.client.VariantResponse;
import com.example.cartservice.entity.Cart;
import com.example.cartservice.entity.CartItem;
import com.example.cartservice.entity.enums.CartStatus;
import com.example.cartservice.exception.AppException;
import com.example.cartservice.exception.ErrorCode;
import com.example.cartservice.repository.CartItemRepository;
import com.example.cartservice.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductClient productClient;
    private final CartItemRepository cartItemRepository;
    private final InventoryClient inventoryClient;

    @Transactional
    @CacheEvict(value = "carts", key = "#userId")
    public CartResponse addItem(UUID userId, AddItemRequest request, String token) {

        // 1. Tìm hoặc tạo cart
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .userId(userId)
                            .status(CartStatus.ACTIVE)
                            .build();
                    return cartRepository.save(newCart);
                });

        // 2. Kiểm tra cart còn active không
        if (cart.getStatus().equals(CartStatus.EXPIRED)) {
            throw new AppException(ErrorCode.CART_EXPIRED);
        }

        // 3. Kiểm tra variant có tồn tại và active không
        ApiResponses<VariantResponse> variantResponse = productClient.getVariantById(
                token,
                request.getProductId(),
                request.getProductVariantId()
        );
        VariantResponse variant = variantResponse.getData();

        if (Boolean.FALSE.equals(variant.getIsActive())) {
            throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
        }

        // 4. Kiểm tra tồn kho từ InventoryService
        ApiResponses<InventoryResponse> inventoryResponse = inventoryClient.getInventory(
                token,
                request.getProductVariantId()
        );
        InventoryResponse inventory = inventoryResponse.getData();

        if (inventory.getAvailableQuantity() < request.getQuantity()) {
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }

        // 5. Thêm hoặc cập nhật item trong cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartAndProductVariantId(
                cart,
                request.getProductVariantId()
        );

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();

            // Kiểm tra tổng quantity sau khi cộng có vượt tồn kho không
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > inventory.getAvailableQuantity()) {
                throw new AppException(ErrorCode.OUT_OF_STOCK);
            }

            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productVariantId(request.getProductVariantId())
                    .quantity(request.getQuantity())
                    .snapshotPrice(variant.getEffectivePrice())
                    .build();

            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        return toCartResponse(cart);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "carts", key = "#userId")
    public CartResponse getCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .map(this::toCartResponse)
                .orElseGet(() -> CartResponse.builder()
                        .userId(userId)
                        .status(CartStatus.ACTIVE)
                        .totalItems(0)
                        .totalPrice(BigDecimal.ZERO)
                        .cartItems(Collections.emptyList())
                        .build());
    }

    @Transactional
    @CacheEvict(value = "carts", key = "#userId")
    public void removeItem(UUID userId, UUID itemId){
        cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        if(!item.getCart().getUserId().equals(userId)){
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }

        cartItemRepository.delete(item);
    }

    @Transactional
    @CacheEvict(value = "carts", key = "#userId")
    public void clearCart(UUID userId) {
        // 1. Tìm cart → không có → throw
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));
        // 2. Xóa tất cả items
        cartItemRepository.deleteByCart(cart);
    }

    @Transactional
    @CacheEvict(value = "carts", key = "#userId")
    public CartResponse updateQuantity(UUID userId, UUID itemId, UpdateQuantityRequest request) {
        CartItem item = cartItemRepository.findBydIdAndUserId(itemId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (request.getQuantity().equals(0)) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));
        return toCartResponse(cart);
    }

    @Transactional
    @CacheEvict(value = "carts", key = "#userId")
    public CartResponse updateVariant(UUID userId, UUID itemId, UpdateVariantRequest request, String token) {

        CartItem item = cartItemRepository.findBydIdAndUserId(itemId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        ApiResponses<VariantResponse> variantResponse = productClient.getVariantById(token, request.getProductId(), request.getProductVariantId());
        VariantResponse variant = variantResponse.getData();
        if(Boolean.FALSE.equals(variant.getIsActive())){
            throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
        }
//        if(variant.getStockQuantity() <= 0){
//            throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
//        }

        item.setProductVariantId(request.getProductVariantId());
        item.setSnapshotPrice(variant.getEffectivePrice());

        cartItemRepository.save(item);

        return toCartResponse(item.getCart());

    }

    @Transactional
    @CacheEvict(value = "carts", key = "#userId")
    public void deleteCart(UUID userId) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        cartItemRepository.deleteByCart(cart);

        cartRepository.delete(cart);
    }

    private CartItemResponse toCartItemResponse(CartItem item) {
        return CartItemResponse.builder()
                .id(item.getId())
                .productVariantId(item.getProductVariantId())
                .quantity(item.getQuantity())
                .snapshotPrice(item.getSnapshotPrice())
                .build();
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getCartItems().stream()
                .map(this::toCartItemResponse)
                .toList();

        BigDecimal totalPrice = items.stream()
                .map(item -> item.getSnapshotPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .userId(cart.getUserId())
                .status(cart.getStatus())
                .expiredAt(cart.getExpiredAt())
                .totalItems(items.size())
                .totalPrice(totalPrice)
                .cartItems(items)
                .build();
    }

}

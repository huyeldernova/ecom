package com.example.cartservice.service;

import com.example.cartservice.client.ProductClient;
import com.example.cartservice.dto.*;
import com.example.cartservice.dto.client.VariantResponse;
import com.example.cartservice.entity.Cart;
import com.example.cartservice.entity.CartItem;
import com.example.cartservice.entity.enums.CartStatus;
import com.example.cartservice.exception.AppException;
import com.example.cartservice.exception.ErrorCode;
import com.example.cartservice.repository.CartItemRepository;
import com.example.cartservice.repository.CartRepository;
import lombok.RequiredArgsConstructor;
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

    @Transactional
    public CartResponse addItem(UUID userId, AddItemRequest request) {
//        Bước 1: Tìm Cart theo userId
//        → Chưa có Cart → tạo Cart mới (status = ACTIVE)
//        → Có Cart nhưng EXPIRED → throw CART_EXPIRED
//        → Có Cart ACTIVE → dùng tiếp
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .userId(userId)
                            .status(CartStatus.ACTIVE)
                            .build();
                    return cartRepository.save(newCart);
                });
        if (cart.getStatus().equals(CartStatus.EXPIRED)) {
            throw new AppException(ErrorCode.CART_EXPIRED);
        }
//Bước 2: Gọi ProductService lấy variant
//        → productClient.getVariantById(productId, variantId)
//        → isActive = false → throw INVALID_PRODUCT_VARIANT
//        → stockQuantity = 0 → throw INVALID_PRODUCT_VARIANT
        ApiResponses<VariantResponse> variantResponse = productClient.getVariantById(request.getProductId(), request.getProductVariantId());
        VariantResponse variant = variantResponse.getData();

        if(Boolean.FALSE.equals(variant.getIsActive())){
            throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
        }
        if(variant.getStockQuantity() <= 0){
            throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
        }
//
//Bước 3: Check item đã có trong Cart chưa?
//        → Tìm theo cartId + productVariantId
//        → Đã có → cộng dồn quantity
//        → Chưa có → tạo CartItem mới
//                    snapshotPrice = variant.effectivePrice
        Optional<CartItem> existingItem = cartItemRepository.findByCartAndProductVariantId(cart, request.getProductVariantId());
        if(existingItem.isPresent()){
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        }else {
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
    public void clearCart(UUID userId) {
        // 1. Tìm cart → không có → throw
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));
        // 2. Xóa tất cả items
        cartItemRepository.deleteByCart(cart);
    }

    @Transactional
    public CartResponse updateQuantity(UUID userId, UUID itemId, UpdateQuantityRequest request) {
        // 1. Dùng findItemOrThrow
        CartItem item = cartItemRepository.findBydIdAndUserId(itemId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
        // 2. quantity = 0 → xóa item → return getCart()
        if(request.getQuantity().equals(0)){
            removeItem(userId, itemId);
            return getCart(userId);
        }
        // 3. quantity > 0 → update → return CartResponse
        else{
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
            return toCartResponse(item.getCart());
        }
    }

    @Transactional
    public CartResponse updateVariant(UUID userId, UUID itemId, UpdateVariantRequest request) {
        // 1. findItemOrThrow
        CartItem item = cartItemRepository.findBydIdAndUserId(itemId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
        // 2. Gọi ProductService validate variant mới
        //    → isActive = false → throw
        //    → stockQuantity = 0 → throw
        ApiResponses<VariantResponse> variantResponse = productClient.getVariantById(request.getProductId(), request.getProductVariantId());
        VariantResponse variant = variantResponse.getData();
        if(Boolean.FALSE.equals(variant.getIsActive())){
            throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
        }
        if(variant.getStockQuantity() <= 0){
            throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
        }
        // 3. Update variantId
        item.setProductVariantId(request.getProductVariantId());
        item.setSnapshotPrice(variant.getEffectivePrice());
        // 4. Update snapshotPrice → lấy giá mới
        cartItemRepository.save(item);

        return toCartResponse(item.getCart());

    }

    @Transactional
    public void deleteCart(UUID userId) {
        // 1. Tìm Cart theo userId → không có → throw gì?
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));
        // 2. Xóa items trước (tại sao phải xóa items trước?)
        cartItemRepository.deleteByCart(cart);
        // 3. Xóa Cart
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

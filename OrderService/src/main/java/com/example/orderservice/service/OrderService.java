package com.example.orderservice.service;

import com.example.orderservice.client.CartClient;
import com.example.orderservice.client.ProductClient;
import com.example.orderservice.dto.*;
import com.example.orderservice.dto.client.cart.CartItemResponse;
import com.example.orderservice.dto.client.cart.CartResponse;
import com.example.orderservice.dto.client.product.VariantResponse;
import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderItem;
import com.example.orderservice.entity.OrderStatus;
import com.example.orderservice.exception.AppException;
import com.example.orderservice.exception.ErrorCode;
import com.example.orderservice.repository.OrderItemRepository;
import com.example.orderservice.repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j

public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartClient cartClient;
    private final ProductClient productClient;
    private final ObjectMapper objectMapper;


    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, UUID userId, String token)  {

        if(orderRepository.existsByUserIdAndStatus(userId,OrderStatus.PENDING)){
            throw new AppException(ErrorCode.ORDER_ALREADY_PENDING);
        }

        CartResponse cart;
        try{
            cart = cartClient.getCart(token).getData();
        }catch(Exception e){
            throw new AppException(ErrorCode.CART_SERVICE_UNAVAILABLE);
        }

        if(cart.getCartItems() == null || cart.getCartItems().isEmpty()){
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        List<OrderItem> orderItems = new ArrayList<>();
        for(CartItemResponse item : cart.getCartItems()){
            VariantResponse variant;
            try{
                variant = productClient.getVariantById(token, item.getProductVariantId()).getData();
            } catch (Exception e) {
                throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
            }

            if (Boolean.FALSE.equals(variant.getIsActive())) {
                throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
            }
            if (variant.getStockQuantity() <= 0) {
                throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
            }

            BigDecimal subtotal = item.getSnapshotPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .productVariantId(item.getProductVariantId())
                    .productName(variant.getProductName())
                    .variantName(variant.getVariantName())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getSnapshotPrice())
                    .subtotal(subtotal)
                    .build();

            // add vào list
            orderItems.add(orderItem);
        }

        BigDecimal totalAmount = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String shippingAddressJson;

        try{
             shippingAddressJson = objectMapper.writeValueAsString(
                    request.getShippingAddress());
        }catch(JsonProcessingException e){
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        Order order = Order.builder()
                .userId(userId)
                .totalAmount(totalAmount)
                .shippingAddress(shippingAddressJson)
                .note(request.getNote())
                .build();

        orderRepository.save(order);

        orderItems.forEach(item -> item.setOrder(order));
        orderItemRepository.saveAll(orderItems);

        try {
            cartClient.clearCart(token);
        } catch (Exception e) {
            log.warn("Clear cart failed for userId: {}", userId, e);
        }


        return toOrderResponse(order);
    }

    public OrderResponse getOrder(UUID orderId, UUID userId) {

        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        return toOrderResponse(order);
    }

    public PageResponse<OrderResponse> getOrders(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Order> ordersPage = orderRepository.findByUserId(userId,pageable);

        List<OrderResponse> orders = ordersPage.getContent().stream()
                .map(this::toOrderResponse)
                .toList();

        return PageResponse.<OrderResponse> builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(ordersPage.getTotalPages())
                .totalElements(ordersPage.getTotalElements())
                .result(orders)
                .build();
    }

    @Transactional
    public void cancelOrder(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if(order.getStatus() == OrderStatus.SHIPPING || order.getStatus() == OrderStatus.DELIVERED){
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_CANCELLED);
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }


    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        OrderStatus currentStatus = order.getStatus();

        List<OrderStatus> allowed = VALID_TRANSITIONS.get(currentStatus);
        if (!allowed.contains(newStatus)) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS_TRANSITION);
        }

        order.setStatus(newStatus);
        orderRepository.save(order);
        return toOrderResponse(order);
    }

    public PageResponse<OrderResponse> getAllOrders(OrderStatus status, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Order> ordersPage;

        if(status == null){
             ordersPage = orderRepository.findAll(pageable);
        }else {
            ordersPage = orderRepository.findByStatus(status, pageable);
        }

        List<OrderResponse> orders = ordersPage.getContent().stream()
                .map(this::toOrderResponse)
                .toList();

        return PageResponse.<OrderResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(ordersPage.getTotalPages())
                .totalElements(ordersPage.getTotalElements())
                .result(orders)
                .build();
    }

    private static final Map<OrderStatus, List<OrderStatus>> VALID_TRANSITIONS = Map.of(
            OrderStatus.PENDING,   List.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, List.of(OrderStatus.SHIPPING,  OrderStatus.CANCELLED),
            OrderStatus.SHIPPING,  List.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, List.of(),
            OrderStatus.CANCELLED, List.of()
    );


    private OrderResponse toOrderResponse(Order order)  {

        ShippingAddressDto addressDto;

        try {
            addressDto = objectMapper.readValue( order.getShippingAddress(),
                    ShippingAddressDto.class);
        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        return OrderResponse.builder()
                .orderItems(order.getOrderItems().stream()
                        .map(this::toOrderItemResponse)
                        .toList())
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(addressDto)
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .build();

    }

    private OrderItemResponse toOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
            .productVariantId(item.getProductVariantId())
            .productName(item.getProductName())
            .variantName(item.getVariantName())
            .quantity(item.getQuantity())
            .unitPrice(item.getUnitPrice())
            .subtotal(item.getSubtotal())
            .build();
    }
}

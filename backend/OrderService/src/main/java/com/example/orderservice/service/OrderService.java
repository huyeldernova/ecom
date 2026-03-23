package com.example.orderservice.service;

import com.example.orderservice.client.CartClient;
import com.example.orderservice.client.InventoryClient;
import com.example.orderservice.client.PaymentClient;
import com.example.orderservice.client.ProductClient;
import com.example.orderservice.dto.*;
import com.example.orderservice.dto.client.cart.CartItemResponse;
import com.example.orderservice.dto.client.cart.CartResponse;
import com.example.orderservice.dto.client.inventory.ReleaseStockRequest;
import com.example.orderservice.dto.client.inventory.ReserveStockRequest;
import com.example.orderservice.dto.client.payment.PaymentRequest;
import com.example.orderservice.dto.client.payment.PaymentResponse;
import com.example.orderservice.dto.client.product.VariantResponse;
import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderItem;
import com.example.orderservice.entity.OrderStatus;
import com.example.orderservice.exception.AppException;
import com.example.orderservice.exception.ErrorCode;
import com.example.orderservice.repository.OrderItemRepository;
import com.example.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.core.JacksonException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;


@Service
@RequiredArgsConstructor
@Slf4j

public class OrderService {

    private static final String INTERNAL_API_KEY = "super-secret-internal-key-123";

    private static final List<OrderStatus> ACTIVE_STATUSES = List.of(
            OrderStatus.CONFIRMED,
            OrderStatus.SHIPPING
    );


    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartClient cartClient;
    private final ProductClient productClient;
    private final ObjectMapper objectMapper;
    private final PaymentClient paymentClient;
    private final InventoryClient inventoryClient;




    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, UUID userId, String token) {

        long activeOrderCount = orderRepository.countByUserIdAndStatusIn(userId, ACTIVE_STATUSES);
        if (activeOrderCount > 0) {
            throw new AppException(ErrorCode.HAS_ACTIVE_ORDER);
        }

        // 1. Lấy cart
        CartResponse cart;
        try {
            cart = cartClient.getCart(token).getData();
        } catch (Exception e) {
            throw new AppException(ErrorCode.CART_SERVICE_UNAVAILABLE);
        }

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        // 2. Build order items từ cart
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItemResponse item : cart.getCartItems()) {
            VariantResponse variant;
            try {
                variant = productClient.getVariantById(token, item.getProductVariantId()).getData();
            } catch (Exception e) {
                throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
            }

            if (Boolean.FALSE.equals(variant.getIsActive())) {
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

            orderItems.add(orderItem);
        }

        // 3. Tính tổng tiền
        BigDecimal totalAmount = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Convert shippingAddress sang JSON
        String shippingAddressJson;
        try {
            shippingAddressJson = objectMapper.writeValueAsString(request.getShippingAddress());
        } catch (JacksonException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        // 5. Lưu order
        Order order = Order.builder()
                .userId(userId)
                .totalAmount(totalAmount)
                .shippingAddress(shippingAddressJson)
                .note(request.getNote())
                .build();

        orderRepository.save(order);

        orderItems.forEach(item -> item.setOrder(order));
        orderItemRepository.saveAll(orderItems);

        // 6. Reserve stock
        Map<UUID, Integer> reservedItems = new LinkedHashMap<>();
        for (CartItemResponse item : cart.getCartItems()) {
            try {
                inventoryClient.reserveStock(
                        INTERNAL_API_KEY,
                        ReserveStockRequest.builder()
                                .productVariantId(item.getProductVariantId())
                                .quantity(item.getQuantity())
                                .orderId(order.getId())
                                .build()
                );
                reservedItems.put(item.getProductVariantId(), item.getQuantity());

            } catch (Exception e) {
                log.error("Failed to reserve stock: {}", item.getProductVariantId(), e);

                // Rollback: release các item đã reserve trước đó
                reservedItems.forEach((variantId, quantity) -> {
                    try {
                        inventoryClient.releaseStock(
                                INTERNAL_API_KEY,
                                ReleaseStockRequest.builder()
                                        .productVariantId(variantId)
                                        .quantity(quantity)
                                        .orderId(order.getId())
                                        .build()
                        );
                    } catch (Exception releaseEx) {
                        log.error("Failed to release stock: {}", variantId, releaseEx);
                    }
                });

                throw new AppException(ErrorCode.OUT_OF_STOCK);
            }
        }

        // 7. Clear cart
        try {
            cartClient.clearCart(token);
        } catch (Exception e) {
            log.warn("Clear cart failed for userId: {}", userId, e);
        }

        return toOrderResponse(order);
    }

    @Transactional
    public OrderResponse checkout(UUID orderId, UUID userId, String token) {

        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_CHECKOUT);
        }

        PaymentRequest paymentRequest = PaymentRequest.builder()
                .orderId(order.getId())
                .amount(order.getTotalAmount().longValue())
                .currency("vnd")
                .build();

        String clientSecret;
        try {
            ApiResponses<PaymentResponse> paymentResponse = paymentClient.createPaymentIntent(token, paymentRequest);
            clientSecret = paymentResponse.getData().getClientSecret();
        } catch (Exception e) {
            log.error("Payment service failed for orderId: {}", orderId, e);
            throw new AppException(ErrorCode.PAYMENT_SERVICE_UNAVAILABLE);
        }

        OrderResponse response = toOrderResponse(order);
        response.setClientSecret(clientSecret);
        return response;
    }



    @Transactional(readOnly = true)
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
    public void cancelExpiredOrder(UUID orderId) {

        // Bước 1: Tìm order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Bước 2: Update status
        if (order.getStatus() != OrderStatus.PENDING) {
            log.warn("Order {} is no longer PENDING, skipping", orderId);
            return;
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Bước 3: Release stock — loop từng item
        for (OrderItem item : order.getOrderItems()) {
            try {
                inventoryClient.releaseStock(
                        INTERNAL_API_KEY,
                        ReleaseStockRequest.builder()
                                .productVariantId(item.getProductVariantId())
                                .quantity(item.getQuantity())
                                .orderId(orderId)
                                .build()
                );
            } catch (Exception e) {
                log.error("Failed to release stock for variant: {}",
                        item.getProductVariantId(), e);
            }
        }
    }


    @Transactional
    public void updateOrderStatus(UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        OrderStatus currentStatus = order.getStatus();

        List<OrderStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, List.of());

        if (!allowed.contains(request.getStatus())) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS_TRANSITION);
        }

        order.setStatus(request.getStatus());
        orderRepository.save(order);
    }

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return toOrderResponse(order);
    }

    private OrderResponse toOrderResponse(Order order) {

        ShippingAddressDto addressDto;
        try {
            addressDto = objectMapper.readValue(order.getShippingAddress(), ShippingAddressDto.class);
        } catch (JacksonException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId())
                .stream()
                .map(this::toOrderItemResponse)
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(addressDto)
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .orderItems(items)
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

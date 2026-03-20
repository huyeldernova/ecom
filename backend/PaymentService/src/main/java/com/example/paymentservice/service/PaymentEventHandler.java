package com.example.paymentservice.service;

import com.example.paymentservice.client.InventoryClient;
import com.example.paymentservice.client.OrderClient;
import com.example.paymentservice.dto.PaymentRequest;
import com.example.paymentservice.dto.PaymentResponse;
import com.example.paymentservice.dto.client.inventory.DeductStockRequest;
import com.example.paymentservice.dto.client.inventory.ReleaseStockRequest;
import com.example.paymentservice.dto.client.order.OrderItemResponse;
import com.example.paymentservice.dto.client.order.OrderResponse;
import com.example.paymentservice.dto.client.order.OrderStatus;
import com.example.paymentservice.dto.client.order.UpdateOrderStatusRequest;
import com.example.paymentservice.entity.Payment;
import com.example.paymentservice.entity.PaymentStatus;
import com.example.paymentservice.exception.AppException;
import com.example.paymentservice.exception.ErrorCode;
import com.example.paymentservice.repository.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentEventHandler {

    private final PaymentRepository paymentRepository;

    private final OrderClient orderClient;

    private final InventoryClient inventoryClient;

    private static final String INTERNAL_API_KEY = "super-secret-internal-key-123";

    @Transactional
    public void handlePaymentSucceeded(Event event) {

        PaymentIntent intent = (PaymentIntent) event
                .getDataObjectDeserializer()
                .getObject()
                .orElseThrow();

        Payment payment = paymentRepository.findByPaymentIntentId(intent.getId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Payment already processed, skipping: {}", intent.getId());
            return;
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        try{
            orderClient.updateOrderStatus(
                    payment.getOrderId(),
                    INTERNAL_API_KEY,
                    new UpdateOrderStatusRequest(OrderStatus.CONFIRMED));
        }catch (Exception e){
            log.error("Failed to update order status for orderId: {}", payment.getOrderId(), e);
            throw new AppException(ErrorCode.ORDER_SERVICE_UNAVAILABLE);

        }

        try {
            OrderResponse order = orderClient.getOrder(
                    payment.getOrderId(),
                    INTERNAL_API_KEY
            ).getData();

            for (OrderItemResponse item : order.getOrderItems()) {
                inventoryClient.deductStock(
                        INTERNAL_API_KEY,
                        DeductStockRequest.builder()
                                .productVariantId(item.getProductVariantId())
                                .quantity(item.getQuantity())
                                .orderId(payment.getOrderId())
                                .build()
                );
            }
        } catch (Exception e) {
            log.error("Failed to deduct stock for orderId: {}", payment.getOrderId(), e);
            throw new AppException(ErrorCode.INVENTORY_SERVICE_UNAVAILABLE);
        }
    }

    @Transactional
    public void handlePaymentFailed(Event event) {
        PaymentIntent intent = (PaymentIntent) event
                .getDataObjectDeserializer()
                .getObject()
                .orElseThrow();

        Payment payment = paymentRepository.findByPaymentIntentId(intent.getId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() == PaymentStatus.FAILED || payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Payment already finalized, skipping: {}", intent.getId());
            return;
        }

        payment.setStatus(PaymentStatus.FAILED);

        paymentRepository.save(payment);

        try{
            orderClient.updateOrderStatus(
                    payment.getOrderId(),
                    INTERNAL_API_KEY,
                    new UpdateOrderStatusRequest(OrderStatus.CANCELLED));
        }catch (Exception e){
            log.error("Failed to update order status for orderId: {}", payment.getOrderId(), e);
        }

        try {
            OrderResponse order = orderClient.getOrder(
                    payment.getOrderId(),
                    INTERNAL_API_KEY
            ).getData();

            for (OrderItemResponse item : order.getOrderItems()) {
                inventoryClient.releaseStock(
                        INTERNAL_API_KEY,
                        ReleaseStockRequest.builder()
                                .productVariantId(item.getProductVariantId())
                                .quantity(item.getQuantity())
                                .orderId(payment.getOrderId())
                                .build()
                );
            }
        } catch (Exception e) {
            log.error("Failed to release stock for orderId: {}", payment.getOrderId(), e);
        }
    }

}

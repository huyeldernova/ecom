package com.example.notificationservice.event;

import com.example.event.PaymentFailedEvent;
import com.example.event.PaymentSucceededEvent;
import com.example.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final NotificationService notificationService;

    @KafkaListener(topics = "payment.succeeded", groupId = "notification-service")
    public void handlePaymentSucceeded(PaymentSucceededEvent event, Acknowledgment acknowledgment) {
        log.info("Received payment.succeeded for orderId: {}", event.getOrderId());
        try {
            notificationService.handlePaymentSucceeded(event);
            acknowledgment.acknowledge();
            log.info("Offset committed for orderId: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to process payment.succeeded for orderId: {}", event.getOrderId(), e);
        }
    }

    @KafkaListener(topics = "payment.failed", groupId = "notification-service")
    public void handlePaymentFailed(PaymentFailedEvent event, Acknowledgment acknowledgment) {
        log.info("Received payment.failed for orderId: {}", event.getOrderId());
        try {
            notificationService.handlePaymentFailed(event);
            acknowledgment.acknowledge();
            log.info("Offset committed for orderId: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to process payment.failed for orderId: {}", event.getOrderId(), e);
        }
    }
}
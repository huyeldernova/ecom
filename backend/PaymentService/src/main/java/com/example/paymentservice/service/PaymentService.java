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
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    private final PaymentEventHandler paymentEventHandler;

    private final PaymentRepository paymentRepository;

    public PaymentResponse createPaymentIntent(PaymentRequest request, UUID userId)  {

        long amount;
        String currency;

        if ("vnd".equalsIgnoreCase(request.getCurrency())) {

            amount = Math.max(request.getAmount() * 100L / 25000L, 50L);
            currency = "usd";
        } else {
            amount = request.getAmount() * 100L;
            currency = request.getCurrency();
        }


        try{
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount)
                    .setCurrency(currency)
                    .putMetadata("orderId", request.getOrderId().toString())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);


            Payment payment = Payment.builder()
                    .orderId(request.getOrderId())
                    .userId(userId)
                    .paymentIntentId(intent.getId())
                    .status(PaymentStatus.PENDING)
                    .amount(request.getAmount())
                    .currency(request.getCurrency())

                    .build();

            paymentRepository.save(payment);

            return PaymentResponse.builder()
                    .clientSecret(intent.getClientSecret())
                    .build();
        }catch (StripeException e) {
            log.error("Stripe API error: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.PAYMENT_SERVICE_UNAVAILABLE);
        }
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader)
    {
        try{

            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            // Xử lý event
            switch (event.getType()) {
                case "payment_intent.succeeded" -> paymentEventHandler.handlePaymentSucceeded(event);
                case "payment_intent.payment_failed" -> paymentEventHandler.handlePaymentFailed(event);
                default -> log.info("Unhandled event: {}", event.getType());
            }
        }catch(SignatureVerificationException e){

            log.error("Invalid webhook signature: {}", e.getMessage());
            throw new AppException(ErrorCode.INVALID_WEBHOOK_SIGNATURE);
        }
    }

}

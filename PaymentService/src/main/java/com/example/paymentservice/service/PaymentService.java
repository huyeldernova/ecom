package com.example.paymentservice.service;

import com.example.paymentservice.dto.PaymentRequest;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class PaymentService {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    public PaymentIntent createPaymentIntent(PaymentRequest request) throws StripeException {

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(request.getAmount())
                .setCurrency(request.getCurrency())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        return PaymentIntent.create(params);
    }


    public void handleWebhook(String payload, String sigHeader)
            throws SignatureVerificationException {

        // Bước 1: Verify từ Stripe
        Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

        // Bước 2: Xử lý event
        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentFailed(event);
            default -> System.out.println("Unhandled event: " + event.getType());
        }
    }

    private void handlePaymentSucceeded(Event event) {
        // TODO: cập nhật DB, gửi email...
        System.out.println("✅ Payment succeeded: " + event.getId());
    }

    private void handlePaymentFailed(Event event) {
        System.out.println("❌ Payment failed: " + event.getId());
    }
}

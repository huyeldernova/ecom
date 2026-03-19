package com.example.paymentservice.controller;

import com.example.paymentservice.dto.ApiResponses;
import com.example.paymentservice.dto.PaymentRequest;
import com.example.paymentservice.dto.PaymentResponse;
import com.example.paymentservice.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    public ApiResponses<PaymentResponse> createPaymentIntent(@RequestBody PaymentRequest request, @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());

        PaymentResponse response = paymentService.createPaymentIntent(request, userId);

         return ApiResponses.<PaymentResponse>builder()
                .code(1000)
                .message("Create payment intent successfully")
                .data(response)
                .build();
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        paymentService.handleWebhook(payload, sigHeader);

        return ResponseEntity.ok("Webhook received");
    }
}
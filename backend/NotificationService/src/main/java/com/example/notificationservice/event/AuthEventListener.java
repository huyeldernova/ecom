package com.example.notificationservice.event;

import com.example.event.OtpPasswordResetEvent;
import com.example.event.OtpVerificationEvent;
import com.example.notificationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthEventListener {

    private final EmailService emailService;

    @KafkaListener(topics = "user.otp.verification", groupId = "notification-service")
    public void handleOtpVerification(OtpVerificationEvent event, Acknowledgment acknowledgment) {
        log.info("Received user.otp.verification for email: {}", event.getEmail());
        try {
            emailService.sendVerificationOtp(
                    event.getEmail(),
                    event.getFirstName(),
                    event.getOtp()
            );
            acknowledgment.acknowledge();
            log.info("Verification OTP email sent to: {}", event.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification OTP to: {}", event.getEmail(), e);
        }
    }

    @KafkaListener(topics = "user.otp.reset", groupId = "notification-service")
    public void handleOtpReset(OtpPasswordResetEvent event, Acknowledgment acknowledgment) {
        log.info("Received user.otp.reset for email: {}", event.getEmail());
        try {
            emailService.sendPasswordResetOtp(
                    event.getEmail(),
                    event.getFirstName(),
                    event.getOtp()
            );
            acknowledgment.acknowledge();
            log.info("Password reset OTP email sent to: {}", event.getEmail());
        } catch (Exception e) {
            log.error("Failed to send reset OTP to: {}", event.getEmail(), e);
        }
    }
}
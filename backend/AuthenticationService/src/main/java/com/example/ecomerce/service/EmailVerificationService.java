package com.example.ecomerce.service;

import com.example.ecomerce.entity.EmailVerificationToken;
import com.example.ecomerce.entity.User;
import com.example.ecomerce.exception.AppException;
import com.example.ecomerce.exception.ErrorCode;
import com.example.ecomerce.repository.EmailVerificationTokenRepository;
import com.example.ecomerce.repository.UserRepository;
import com.example.event.OtpVerificationEvent;
import com.example.event.UserVerifiedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private static final long OTP_EXPIRE_MINUTES = 10;

    private final EmailVerificationTokenRepository tokenRepository;

    private final UserRepository userRepository;

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // ─── Dùng khi: register() và resendVerification()
    @Transactional
    public void generateAndSendOtp(User user){

        // 1. Xóa token cũ — đảm bảo tại 1 thời điểm chỉ có 1 OTP hợp lệ
        tokenRepository.deleteByUserId(user.getId());

        // 2. Sinh OTP 6 số — %06d đảm bảo đủ 6 chữ số kể cả khi bắt đầu bằng 0
        String otp = String.format("%06d", new Random().nextInt(1_000_000));

        // 3. Lưu token vào DB
        EmailVerificationToken token = EmailVerificationToken.builder()
                .userId(user.getId())
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRE_MINUTES))
                .used(false)
                .build();

        tokenRepository.save(token);

        // 4. Publish Kafka event — NotificationService sẽ tự gửi email
        kafkaTemplate.send("user.otp.verification",
                OtpVerificationEvent.builder()
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .otp(otp)
                        .build()
        );

        log.info("OTP verification event published for userId: {}", user.getId());
    }

    // ─── User submit OTP từ email
    @Transactional
    public void verifyEmail(String otp) {

        EmailVerificationToken token = tokenRepository.findByOtp(otp)
                .orElseThrow(() -> new AppException(ErrorCode.VERIFICATION_TOKEN_NOT_FOUND));

        if (token.isUsed()) {
            throw new AppException(ErrorCode.VERIFICATION_TOKEN_USED);
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.VERIFICATION_TOKEN_EXPIRED);
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setEmailVerified(true);
        user.setEnabled(true);
        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);

        //  publish event để ProfileService và NotificationService xử lý
        kafkaTemplate.send("user.verified",
                UserVerifiedEvent.builder()
                        .userId(user.getId())
                        .email(user.getEmail())
                        .name(user.getFirstName() + " " + user.getLastName())
                        .build()
        );

        log.info("Email verified + user.verified event published for userId: {}", user.getId());
    }

    // ─── User bấm "Gửi lại OTP
    @Transactional
    public void resendVerification(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

        if (user.isEmailVerified()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_VERIFIED);
        }

        // Tái sử dụng method trên — tự xóa token cũ + tạo mới + gửi Kafka
        generateAndSendOtp(user);
    }
}

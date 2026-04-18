package com.example.ecomerce.service;

import com.example.ecomerce.entity.User;
import com.example.ecomerce.exception.AppException;
import com.example.ecomerce.exception.ErrorCode;
import com.example.ecomerce.repository.UserRepository;
import com.example.event.OtpPasswordResetEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private static final String REDIS_KEY_PREFIX   = "pwd_reset:";
    private static final long   OTP_EXPIRE_MINUTES = 15;

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final PasswordEncoder passwordEncoder;

    // ─── Bước 1: User nhập email → hệ thống gửi OTP ─────────────────────────
    public void sendResetOtp(String email) {

        // ifPresent — không throw exception dù email không tồn tại
        // Lý do: tránh User Enumeration Attack
        //        kẻ xấu không biết email nào đã đăng ký
        userRepository.findByEmail(email).ifPresent(user -> {

            String otp = String.format("%06d", new Random().nextInt(1_000_000));

            // Lưu vào Redis — TTL tự động expire, không cần entity hay cột used
            redisTemplate.opsForValue().set(
                    REDIS_KEY_PREFIX + user.getId(),
                    otp,
                    Duration.ofMinutes(OTP_EXPIRE_MINUTES)
            );

            // Publish Kafka event — NotificationService gửi email
            kafkaTemplate.send("user.otp.reset",
                    OtpPasswordResetEvent.builder()
                            .email(user.getEmail())
                            .firstName(user.getFirstName())
                            .otp(otp)
                            .build()
            );

            log.info("Password reset OTP event published for userId: {}", user.getId());
        });
    }

    // ─── Bước 2: User nhập email + OTP + password mới ────────────────────────
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

        // 1. Lấy OTP từ Redis
        //    Null = hết hạn (Redis tự xóa) hoặc chưa từng request reset
        String storedOtp = redisTemplate.opsForValue()
                .get(REDIS_KEY_PREFIX + user.getId());

        if (storedOtp == null) {
            throw new AppException(ErrorCode.RESET_TOKEN_EXPIRED);
        }

        // 2. So sánh OTP — sai thì báo không hợp lệ
        if (!storedOtp.equals(otp)) {
            throw new AppException(ErrorCode.RESET_TOKEN_NOT_FOUND);
        }

        // 3. Đổi password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 4. Xóa OTP khỏi Redis — tránh reuse (thay thế cho cột used=true)
        redisTemplate.delete(REDIS_KEY_PREFIX + user.getId());

        log.info("Password reset successfully for userId: {}", user.getId());
    }

    // ─── Change Password — user đã login ─────────────────────────────────────
    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 1. Verify mật khẩu cũ
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new AppException(ErrorCode.WRONG_OLD_PASSWORD);
        }

        // 2. Không cho đặt lại mật khẩu trùng với cũ
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new AppException(ErrorCode.NEW_PASSWORD_SAME_AS_OLD);
        }

        // 3. Lưu password mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed successfully for userId: {}", user.getId());
    }
}
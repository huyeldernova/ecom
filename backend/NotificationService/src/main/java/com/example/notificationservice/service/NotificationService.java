package com.example.notificationservice.service;

import com.example.event.PaymentFailedEvent;
import com.example.event.PaymentSucceededEvent;
import com.example.event.UserRegisteredEvent;
import com.example.event.UserVerifiedEvent;
import com.example.notificationservice.dto.PageResponse;
import com.example.notificationservice.entity.Notification;
import com.example.notificationservice.entity.NotificationType;
import com.example.notificationservice.entity.NotificationUser;
import com.example.notificationservice.exception.AppException;
import com.example.notificationservice.exception.ErrorCode;
import com.example.notificationservice.repository.NotificationRepository;
import com.example.notificationservice.repository.NotificationUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationUserRepository notificationUserRepository;
    private final EmailService emailService;

    public void handleUserRegistered(UserRegisteredEvent event){
        boolean exists = notificationUserRepository.findByUserId(UUID.fromString(event.getUserId().toString()))
                .isPresent();

        if(exists){
            log.warn("NotificationUser already exists for userId: {}", event.getUserId());
            return;
        }

        NotificationUser user = NotificationUser.builder()
                .userId(event.getUserId())
                .email(event.getEmail())
                .name(event.getName())
                .build();

        notificationUserRepository.save(user);

        emailService.sendWelcomeEmail(event.getEmail(), event.getName());
        log.info("NotificationUser saved for userId: {}", event.getUserId());

    }

    public void handlePaymentSucceeded(PaymentSucceededEvent event) {
        UUID userId = UUID.fromString(event.getUserId());

        // 1. Lưu DB trước — idempotency check bên trong
        Notification notification = saveNotification(
                userId,
                "Thanh toán thành công",
                "Đơn hàng #" + event.getOrderId() + " đã được thanh toán thành công. Số tiền: " + event.getAmount() + " " + event.getCurrency(),
                NotificationType.PAYMENT_SUCCESS,
                event.getOrderId()
        );

        // 2. Gửi email — chỉ khi chưa gửi
        if (notification != null && !notification.isEmailSent()) {

            NotificationUser user = notificationUserRepository
                    .findByUserId(userId)
                    .orElse(null);

            if (user != null) {
                emailService.sendPaymentSuccessEmail(
                        user.getEmail(),
                        user.getName(),
                        event.getOrderId(),
                        event.getAmount(),
                        event.getCurrency(),
                        LocalDateTime.now()
                );
            } else {
                log.warn("NotificationUser not found for userId: {} — using email from event", userId);
                emailService.sendPaymentSuccessEmail(
                        event.getEmail(),
                        "Khách hàng",
                        event.getOrderId(),
                        event.getAmount(),
                        event.getCurrency(),
                        LocalDateTime.now()
                );
            }

            // 3. Đánh dấu đã gửi email
            notification.setEmailSent(true);
            notificationRepository.save(notification);
            log.info("Email sent and marked for orderId: {}", event.getOrderId());
        }
    }

    public void handlePaymentFailed(PaymentFailedEvent event) {
        UUID userId = UUID.fromString(event.getUserId());

        // 1. Lưu DB trước — idempotency check bên trong
        Notification notification = saveNotification(
                userId,
                "Thanh toán thất bại",
                "Đơn hàng #" + event.getOrderId() + " thanh toán không thành công. Vui lòng thử lại.",
                NotificationType.PAYMENT_FAILED,
                event.getOrderId()
        );

        // 2. Gửi email — chỉ khi chưa gửi
        if (notification != null && !notification.isEmailSent()) {

            NotificationUser user = notificationUserRepository
                    .findByUserId(userId)
                    .orElse(null);

            if (user != null) {
                emailService.sendPaymentFailedEmail(
                        user.getEmail(),
                        user.getName(),
                        event.getOrderId(),
                        event.getAmount(),
                        event.getCurrency()
                );
            } else {
                log.warn("NotificationUser not found for userId: {} — using email from event", userId);
                emailService.sendPaymentFailedEmail(
                        event.getEmail(),
                        "Khách hàng",
                        event.getOrderId(),
                        event.getAmount(),
                        event.getCurrency()
                );
            }

            // 3. Đánh dấu đã gửi email
            notification.setEmailSent(true);
            notificationRepository.save(notification);
            log.info("Email sent and marked for orderId: {}", event.getOrderId());
        }
    }

    public PageResponse<Notification> getNotifications(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> result = notificationRepository.findByUserId(userId, pageable);

        return PageResponse.<Notification>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(result.getTotalPages())
                .totalElements(result.getTotalElements())
                .result(result.getContent())
                .build();
    }

    public void markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.NOTIFICATION_ACCESS_DENIED);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }


    public void handleUserVerified(UserVerifiedEvent event) {
        // Tạo NotificationUser nếu chưa có
        boolean exists = notificationUserRepository
                .findByUserId(event.getUserId()).isPresent();

        if (!exists) {
            notificationUserRepository.save(
                    NotificationUser.builder()
                            .userId(event.getUserId())
                            .email(event.getEmail())
                            .name(event.getName())
                            .build()
            );
        }

        // Gửi welcome email — đúng thời điểm: sau khi verify xong
        emailService.sendWelcomeEmail(event.getEmail(), event.getName());
        log.info("Welcome email sent for userId: {}", event.getUserId());
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    private Notification saveNotification(UUID userId, String title, String content, NotificationType type, String orderId) {

        if (orderId != null && notificationRepository.existsByOrderId(orderId)) {
            log.warn("Duplicate notification for orderId: {} — skipping", orderId);
            return notificationRepository.findByOrderId(orderId).orElse(null);
        }
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setType(type);
        notification.setEmailSent(false);

        return notificationRepository.save(notification);
    }


}

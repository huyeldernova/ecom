package com.example.notificationservice.repository;

import com.example.notificationservice.entity.Notification;
import com.example.notificationservice.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    // Lấy tất cả của user — có phân trang
    Page<Notification> findByUserId(UUID userId, Pageable pageable);

    // Filter theo chưa đọc
    Page<Notification> findByUserIdAndRead(UUID userId, boolean read, Pageable pageable);

    // Filter theo type
    Page<Notification> findByUserIdAndType(UUID userId, NotificationType type, Pageable pageable);

    // Đếm số chưa đọc — hiển thị badge
    long countByUserIdAndRead(UUID userId, boolean read);

    boolean existsByOrderId(String orderId);

    Optional<Notification> findByOrderId(String orderId);

}
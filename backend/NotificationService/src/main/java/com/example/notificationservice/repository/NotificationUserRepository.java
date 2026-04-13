package com.example.notificationservice.repository;

import com.example.notificationservice.entity.NotificationUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationUserRepository extends JpaRepository<NotificationUser, UUID> {
    Optional<NotificationUser> findByUserId(UUID userId);
}
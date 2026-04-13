package com.example.ecomerce.repository;

import com.example.ecomerce.entity.OutboxEvent;
import com.example.ecomerce.enums.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxRepository extends JpaRepository<OutboxEvent, UUID> {

    List<OutboxEvent> findByStatusAndRetryCountLessThan(OutboxStatus status, Integer maxRetry);
}
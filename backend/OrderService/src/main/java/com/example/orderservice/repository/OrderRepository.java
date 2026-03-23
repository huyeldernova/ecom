package com.example.orderservice.repository;

import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {
    Page<Order> findByUserId(UUID userId, Pageable page);
    boolean existsByUserIdAndStatus(UUID userid, OrderStatus status);
    Optional<Order>findByIdAndUserId(UUID id, UUID userId);

    Page<Order>findByStatus(OrderStatus status, Pageable page);
    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime dateTime);

    long countByUserIdAndStatusIn(UUID userId, List<OrderStatus> statuses);



}

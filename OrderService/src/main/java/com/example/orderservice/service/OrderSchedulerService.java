package com.example.orderservice.service;

import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderStatus;
import com.example.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderSchedulerService {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Scheduled(fixedRate = 60000)
    public void cancelExpiredOrders() {

        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBefore(
                OrderStatus.PENDING,
                LocalDateTime.now().minusMinutes(15)
        );

        log.info("Found {} expired orders to cancel", expiredOrders.size());

        for (Order order : expiredOrders) {
            try {
                orderService.cancelExpiredOrder(order.getId());
                log.info("Cancelled expired order: {}", order.getId());
            } catch (Exception e) {
                log.error("Failed to cancel order: {}", order.getId(), e);
            }
        }
    }
}
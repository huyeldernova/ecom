package com.example.paymentservice.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "payments",
        indexes = {
                @Index(name = "idx_payment_intent_id", columnList = "payment_intent_id"),
                @Index(name = "idx_payment_order_id",  columnList = "order_id")
        }
)public class Payment extends BaseEntity {

    @Column(nullable = false)
    private UUID orderId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, unique = true)
    private String paymentIntentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private Long amount;

    private LocalDateTime paidAt;

}
package com.example.inventoryservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "inventory",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "product_variant_id")
        }
)
public class Inventory extends BaseEntity {

    @Column(nullable = false)
    private UUID productVariantId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer reservedQuantity;

    @Version
    private Long version;

    @Column(nullable = false)
    @Builder.Default
    private Integer threshold = 10;

    @Transient
    public Integer getAvailableQuantity() {
        return quantity - reservedQuantity;
    }
}
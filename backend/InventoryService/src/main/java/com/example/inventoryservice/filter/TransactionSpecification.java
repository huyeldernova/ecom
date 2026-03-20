package com.example.inventoryservice.filter;

import com.example.inventoryservice.entity.InventoryTransaction;
import com.example.inventoryservice.entity.TransactionType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.UUID;

public class TransactionSpecification {

    public static Specification<InventoryTransaction> hasType(TransactionType type) {
        return (root, query, cb) -> {
            if (type == null) {
                return null;
            }
            return cb.equal(root.get("type"), type);
        };
    }

    public static Specification<InventoryTransaction> hasReason(String reason) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(reason)) {
                return null;
            }

            return cb.like(
                    cb.lower(root.get("reason")),
                    "%" + reason.toLowerCase() + "%"
            );
        };
    }

    public static Specification<InventoryTransaction> fromDate(Instant from) {
        return (root, query, cb) -> {
            if (from == null) {
                return null;
            }

            return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
        };
    }

    public static Specification<InventoryTransaction> toDate(Instant to) {
        return (root, query, cb) -> {
            if (to == null) {
                return null;
            }

            return cb.lessThanOrEqualTo(root.get("createdAt"), to);
        };
    }

    public static Specification<InventoryTransaction> hasInventoryId(UUID inventoryId) {
        return (root, query, cb) ->
                inventoryId == null ? null : cb.equal(root.get("inventory").get("id"), inventoryId);
    }
}
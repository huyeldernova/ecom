package com.example.inventoryservice.repository;

import com.example.inventoryservice.entity.InventoryTransaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, UUID>, JpaSpecificationExecutor<InventoryTransaction> {

    Page<InventoryTransaction> findByInventoryId(UUID inventoryId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM InventoryTransaction t " +
            "WHERE t.inventory.id = :inventoryId " +
            "AND t.type = 'DEDUCT' " +
            "AND t.createdAt >= :since")
    int sumDeductedQuantityAfter(
            @Param("inventoryId") UUID inventoryId,
            @Param("since") Instant since
    );

}

package com.example.inventoryservice.repository;

import com.example.inventoryservice.entity.InventoryTransaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, UUID>, JpaSpecificationExecutor<InventoryTransaction> {

    Page<InventoryTransaction> findByInventoryId(UUID inventoryId, Pageable pageable);

}

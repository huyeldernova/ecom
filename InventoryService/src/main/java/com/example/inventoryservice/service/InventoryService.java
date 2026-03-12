package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.*;
import com.example.inventoryservice.entity.Inventory;
import com.example.inventoryservice.entity.InventoryTransaction;
import com.example.inventoryservice.entity.TransactionType;
import com.example.inventoryservice.exception.AppException;
import com.example.inventoryservice.exception.ErrorCode;
import com.example.inventoryservice.filter.TransactionSpecification;
import com.example.inventoryservice.repository.InventoryRepository;
import com.example.inventoryservice.repository.InventoryTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    @Transactional
    public InventoryResponse deductStock(DeductStockRequest request){

        Inventory inventory = inventoryRepository.findByProductVariantId(request.getProductVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        if(inventory.getAvailableQuantity() < request.getQuantity()){
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }

        Integer newQuantity = inventory.getQuantity() - request.getQuantity();
        inventory.setQuantity(newQuantity);

        inventoryRepository.save(inventory);


        InventoryTransaction transaction = InventoryTransaction.builder()
                .inventory(inventory)
                .type(TransactionType.DEDUCT)
                .quantity(request.getQuantity())
                .reason(request.getOrderId().toString())
                .build();

        inventoryTransactionRepository.save(transaction);


        return toInventoryResponse(inventory);
    }

    @Transactional
    public InventoryResponse createInventory(CreateInventoryRequest request){

        if (inventoryRepository.existsByProductVariantId(request.getProductVariantId())) {
            throw new AppException(ErrorCode.INVENTORY_ALREADY_EXISTS);
        }
        Inventory inventory = Inventory.builder()
                .productVariantId(request.getProductVariantId())
                .quantity(request.getQuantity())
                .reservedQuantity(0)
                .build();

        inventoryRepository.save(inventory);

        InventoryTransaction transaction = InventoryTransaction.builder()
                .inventory(inventory)
                .type(TransactionType.IMPORT)
                .quantity(request.getQuantity())
                .reason("initial_stock")
                .build();

        inventoryTransactionRepository.save(transaction);


        return toInventoryResponse(inventory);
    }

    @Transactional
    public InventoryResponse releaseStock(ReleaseStockRequest request){

        Inventory inventory = inventoryRepository.findByProductVariantId(request.getProductVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        Integer newQuantity = inventory.getQuantity() + request.getQuantity();
        inventory.setQuantity(newQuantity);

        inventoryRepository.save(inventory);

        InventoryTransaction transaction = InventoryTransaction.builder()
                .inventory(inventory)
                .type(TransactionType.RELEASE)
                .quantity(request.getQuantity())
                .reason(request.getOrderId().toString())
                .build();

        inventoryTransactionRepository.save(transaction);


        return toInventoryResponse(inventory);

    }

    @Transactional
    public InventoryResponse importStock(ImportStockRequest request){

        Inventory inventory = inventoryRepository.findByProductVariantId(request.getProductVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        Integer newQuantity = inventory.getQuantity() + request.getQuantity();
        inventory.setQuantity(newQuantity);

        inventoryRepository.save(inventory);

        InventoryTransaction transaction = InventoryTransaction.builder()
                .inventory(inventory)
                .type(TransactionType.IMPORT)
                .quantity(request.getQuantity())
                .reason(request.getReason())
                .build();

        inventoryTransactionRepository.save(transaction);

        return toInventoryResponse(inventory);

    }

    public InventoryResponse getInventory(UUID productVariantId){

        Inventory inventory = inventoryRepository.findByProductVariantId(productVariantId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));
        return toInventoryResponse(inventory);
    }

    public PageResponse<InventoryTransactionResponse>getAllTransactions(TransactionFilterRequest request){
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        Inventory inventory = inventoryRepository.findByProductVariantId(request.getProductVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        Specification<InventoryTransaction> spec = Specification
                .where(TransactionSpecification.hasType(request.getType()))
                .and(TransactionSpecification.hasReason(request.getReason()))
                .and(TransactionSpecification.hasInventoryId(inventory.getId()))
                .and(TransactionSpecification.fromDate(request.getFrom()))
                .and(TransactionSpecification.toDate(request.getTo()));

        Page<InventoryTransaction> transactionPage = inventoryTransactionRepository.findAll(spec, pageable);


        List<InventoryTransactionResponse> content = transactionPage.getContent().stream()
                .map(this::toTransactionResponse)
                .toList();

        return PageResponse.<InventoryTransactionResponse>builder()
                .currentPage(request.getPage())
                .pageSize(request.getSize())
                .totalPages(transactionPage.getTotalPages())
                .totalElements(transactionPage.getTotalElements())
                .result(content)
                .build();
    }

    private InventoryTransactionResponse toTransactionResponse(InventoryTransaction transaction){
        return InventoryTransactionResponse.builder()
                .productVariantId(transaction.getInventory().getProductVariantId())
                .type(transaction.getType())
                .quantity(transaction.getQuantity())
                .reason(transaction.getReason())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private InventoryResponse toInventoryResponse (Inventory inventory){
        return InventoryResponse.builder()
                .productVariantId(inventory.getProductVariantId())
                .quantity(inventory.getQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .availableQuantity(inventory.getAvailableQuantity())
                .build();
    }


}

package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.DeductStockRequest;
import com.example.inventoryservice.dto.InventoryResponse;
import com.example.inventoryservice.exception.AppException;
import com.example.inventoryservice.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryCommandService {

    private final InventoryService inventoryService;

    public InventoryResponse deductStock(DeductStockRequest request) {
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                return inventoryService.deductStock(request);
            } catch (OptimisticLockingFailureException e) {
                if (attempt == 3) throw new AppException(ErrorCode.CONFLICT);
            }
        }
        throw new AppException(ErrorCode.CONFLICT); // unreachable nhưng compiler cần
    }
}

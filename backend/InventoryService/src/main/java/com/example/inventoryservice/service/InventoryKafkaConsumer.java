package com.example.inventoryservice.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.event.VariantCreatedEvent;
import com.example.inventoryservice.dto.CreateInventoryRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryKafkaConsumer {

    private final InventoryService inventoryService;
    private final ObjectMapper objectMapper = new ObjectMapper(); // ✅ tạo thẳng, không inject

    @KafkaListener(topics = "variant.created", groupId = "inventory-service")
    public void handleVariantCreated(String message) {
        try {
            VariantCreatedEvent event = objectMapper.readValue(message, VariantCreatedEvent.class);
            log.info("Received variant.created for variantId: {}", event.getVariantId());

            if (inventoryService.existsByVariantId(event.getVariantId())) {
                log.warn("Inventory already exists for variantId: {}", event.getVariantId());
                return;
            }

            inventoryService.createInventory(
                    CreateInventoryRequest.builder()
                            .productVariantId(event.getVariantId())
                            .quantity(0)
                            .build()
            );

            log.info("Inventory created for variantId: {}", event.getVariantId());
        } catch (Exception e) {
            log.error("Failed to process variant.created event: {}", e.getMessage());
        }
    }
}
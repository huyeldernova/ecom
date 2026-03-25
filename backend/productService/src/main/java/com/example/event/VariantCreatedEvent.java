package com.example.event;


import lombok.*;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantCreatedEvent {
    private UUID variantId;
    private UUID productId;
    private String sku;
}
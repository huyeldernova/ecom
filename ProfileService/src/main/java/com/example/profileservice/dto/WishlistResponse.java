package com.example.profileservice.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponse {

    private UUID id;

    private UUID productId;

    private LocalDateTime createdAt;

}

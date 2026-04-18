package com.example.event;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVerifiedEvent {
    private UUID userId;
    private String email;
    private String name;
}
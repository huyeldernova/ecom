package com.example.profileservice.dto;

import com.example.profileservice.entity.Label;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {
    private UUID id;

    private String fullName;

    private String phone;

    private String street;

    private String city;

    private String country;

    private boolean defaultAddress;

    private Label label;
}

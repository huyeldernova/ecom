package com.example.profileservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String fullName;

    private String phone;

    private String street;

    private String city;

    private String country;

    private boolean defaultAddress;

    @Enumerated(EnumType.STRING)
    private Label label;

    @JoinColumn(name = "profile_id", nullable = false)
    private UUID profileId;
}

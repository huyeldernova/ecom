package com.example.profileservice.dto;

import com.example.profileservice.entity.Gender;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {

    private UUID id;

    private String userName;

    private String firstName;

    private String lastName;

    private LocalDate birthDate;

    private Gender gender;

    private String phoneNumber;

    private String bio;

    private String avatar;
}

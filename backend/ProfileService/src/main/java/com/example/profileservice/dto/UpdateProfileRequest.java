package com.example.profileservice.dto;

import com.example.profileservice.entity.Gender;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class UpdateProfileRequest {

    private String userName;

    private String firstName;

    private String lastName;

    private LocalDate birthDate;

    private Gender gender;

    private String phoneNumber;

    private String bio;

    private String avatar;
}

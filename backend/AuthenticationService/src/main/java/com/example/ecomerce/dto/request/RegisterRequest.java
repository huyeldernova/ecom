package com.example.ecomerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import org.hibernate.validator.constraints.Length;

@Getter
public class RegisterRequest {
    @NotBlank(message = "Email cannot be blank")
    private String email;

    @NotBlank(message = "firstName cannot be blank")
    private String firstName;

    @NotBlank(message = "lastName cannot be blank")
    private String lastName;

    @NotBlank(message = "Password cannot be blank")
    @Length(min = 6, message = "...")
    private String password;
}

package com.example.ecomerce.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;

@Getter
public class LoginRequest implements Serializable {
    @NotBlank(message = "Email cannot be blank")
    @Email
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Length(min = 6, message = "Password must be greater than 6 character")
    private String password;
}

package com.example.event;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpVerificationEvent {

    private String email;
    private String firstName;
    private String otp;
}

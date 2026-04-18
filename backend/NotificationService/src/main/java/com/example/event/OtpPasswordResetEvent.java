package com.example.event;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpPasswordResetEvent {

    private String email;
    private String firstName;
    private String otp;
}
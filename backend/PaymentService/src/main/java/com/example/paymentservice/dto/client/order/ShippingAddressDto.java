package com.example.paymentservice.dto.client.order;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddressDto {

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String street;

    private String city;

    private String state;

    private String zipCode;

    private String country;
}
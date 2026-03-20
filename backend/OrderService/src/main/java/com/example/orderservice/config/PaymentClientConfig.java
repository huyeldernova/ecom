package com.example.orderservice.config;

import com.example.orderservice.client.PaymentClient;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.service.registry.ImportHttpServices;

@Configuration
@ImportHttpServices(group = "payment", types = {PaymentClient.class})
public class PaymentClientConfig {
}

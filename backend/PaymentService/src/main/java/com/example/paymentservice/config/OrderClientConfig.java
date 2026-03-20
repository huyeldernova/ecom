package com.example.paymentservice.config;

import com.example.paymentservice.client.OrderClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.service.registry.ImportHttpServices;

@Configuration
@ImportHttpServices(group = "Order", types = {OrderClient.class})
public class OrderClientConfig {
}

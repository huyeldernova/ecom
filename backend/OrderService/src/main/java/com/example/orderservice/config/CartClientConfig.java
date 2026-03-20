package com.example.orderservice.config;

import com.example.orderservice.client.CartClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.service.registry.ImportHttpServices;

@Configuration
@ImportHttpServices(group = "cart", types = {CartClient.class})
public class CartClientConfig {
}

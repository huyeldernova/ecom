package com.example.orderservice.config;

import com.example.orderservice.client.ProductClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.service.registry.ImportHttpServices;

@Configuration
@ImportHttpServices(group = "product", types = {ProductClient.class})
public class ProductClientConfig {
}

package com.example.cartservice.config;

import com.example.cartservice.client.InventoryClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.service.registry.ImportHttpServices;

@Configuration
@ImportHttpServices(group = "inventory", types = {InventoryClient.class})
public class InventoryClientConfig {
}

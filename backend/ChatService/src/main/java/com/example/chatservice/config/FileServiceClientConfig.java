package com.example.chatservice.config;


import com.example.chatservice.client.FileServiceClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.service.registry.ImportHttpServices;

@Configuration
@ImportHttpServices(group = "file", types = {FileServiceClient.class})
public class FileServiceClientConfig {
}
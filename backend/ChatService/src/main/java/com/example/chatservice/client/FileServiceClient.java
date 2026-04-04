package com.example.chatservice.client;


import com.example.chatservice.dto.client.LinkFilesRequest;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PatchExchange;



@HttpExchange(url = "http://localhost:8087/file")
public interface FileServiceClient {

    @PatchExchange("/api/v1/files/internal/link")
    void linkFiles(@RequestBody LinkFilesRequest request);
}
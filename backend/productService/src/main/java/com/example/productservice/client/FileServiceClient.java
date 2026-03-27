package com.example.productservice.client;


import com.example.productservice.dto.ApiResponses;
import com.example.productservice.dto.client.LinkFilesRequest;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.DeleteExchange;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PatchExchange;
import org.springframework.web.service.annotation.PostExchange;

import java.util.List;
import java.util.UUID;

@HttpExchange(url = "http://localhost:8087/file")
public interface FileServiceClient {

    @PatchExchange("/api/v1/files/internal/link")
    ApiResponses<Void> linkFiles(@RequestBody LinkFilesRequest request);

    @DeleteExchange("/api/v1/files/internal/batch")
    ApiResponses<Void> deleteByIds(@RequestBody List<UUID> fileIds);
}
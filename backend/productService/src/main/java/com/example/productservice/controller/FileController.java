package com.example.productservice.controller;

import com.example.productservice.dto.ApiResponses;
import com.example.productservice.dto.FileMetaDataResponse;
import com.example.productservice.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping
    ApiResponses<List<FileMetaDataResponse>> uploadMedia(@RequestParam List<MultipartFile> files) {
        var result = fileService.uploadFileSync(files);
        return ApiResponses.<List<FileMetaDataResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("File uploaded successfully")
                .data(result)
                .build();
    }
}

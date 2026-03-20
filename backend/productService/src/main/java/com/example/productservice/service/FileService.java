package com.example.productservice.service;

import com.example.productservice.dto.FileMetaDataResponse;
import com.example.productservice.dto.S3Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {

    private final S3Client s3Client;
    private final S3Properties s3Properties;


    public List<FileMetaDataResponse> uploadFileSync(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return new ArrayList<>();
        }

        List<FileMetaDataResponse> fileMetaData = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            validateUploadFile(file);

            try {
                String imageUrl = uploadFileToS3(file);

                FileMetaDataResponse metaData = FileMetaDataResponse.builder()
                        .name(file.getOriginalFilename())
                        .contentType(file.getContentType())
                        .size(file.getSize())
                        .url(imageUrl)
                        .displayOrder(i + 1)
                        .build();

                fileMetaData.add(metaData);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload file error: " + e.getMessage());
            }
        }
        return fileMetaData;
    }

    private String uploadFileToS3(MultipartFile file) throws IOException {

        String bucket = s3Properties.getBucketName();
        String region = s3Properties.getRegion();

        String key = generateKeyName(file);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

        RequestBody requestBody = RequestBody.fromBytes(file.getBytes());
        s3Client.putObject(putObjectRequest, requestBody);

        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key);
    }

    private void validateUploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            return;
        }

        if (file.getSize() > s3Properties.getMaxSize()) {
            throw new RuntimeException("Upload file size is greater than s3 file size");
        }
    }

    public static String generateKeyName(MultipartFile file) {
        String originalFilename = Objects.requireNonNull(file.getOriginalFilename());
        return UUID.randomUUID() + "_" + originalFilename
                .substring(originalFilename.lastIndexOf("."));
    }
}

package com.example.fileservice.service;

import com.example.fileservice.dto.FileResponse;
import com.example.fileservice.dto.S3Properties;
import com.example.fileservice.entity.FileRecord;
import com.example.fileservice.entity.MediaType;
import com.example.fileservice.entity.Status;
import com.example.fileservice.entity.TargetType;
import com.example.fileservice.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {

    private final S3Properties s3Properties;
    private final S3Client s3Client;
    private final FileRepository fileRepository;

    // ─── UPLOAD ───────────────────────────────────────────────────────────────

    public List<FileResponse> uploadFiles(
            List<MultipartFile> files,
            UUID uploadedBy
    ) {
        if (files == null || files.isEmpty()) return new ArrayList<>();

        List<FileResponse> responses = new ArrayList<>();

        for (MultipartFile file : files) {
            validateFile(file);

            String s3Key = null;
            try {
                s3Key = generateS3Key(file.getContentType(), file.getOriginalFilename());

                String url = buildUrl(s3Key);

                MediaType mediaType = detectMediaType(file.getContentType());

                String thumbnailUrl = null;
                if (mediaType == MediaType.VIDEO) {
                    // Video chưa có thumbnail tự động
                    // thumbnailUrl có thể set sau khi generate thumbnail
                    // Hiện tại để null, client tự handle
                    thumbnailUrl = null;
                }

                FileRecord record = FileRecord.builder()
                        .name(file.getOriginalFilename())
                        .url(url)
                        .thumbnailUrl(thumbnailUrl)
                        .contentType(file.getContentType())
                        .size(file.getSize())
                        .mediaType(mediaType)
                        .uploadedBy(uploadedBy)
                        .build();

                fileRepository.save(record);
                responses.add(toResponse(record));

            } catch (Exception e) {
                if (s3Key != null) {
                    tryDeleteFromS3(s3Key);
                }
                throw new RuntimeException("Failed to upload file: "
                        + file.getOriginalFilename(), e);
            }
        }

        return responses;
    }

    // ─── LINK ────────────────────────────────────────────────────────────────

    public void linkFiles(
            List<UUID> fileIds,
            UUID targetId,
            TargetType targetType,
            UUID requesterId
    ) {
        if (fileIds == null || fileIds.isEmpty()) return;

        List<FileRecord> records = fileRepository.findByIdIn(fileIds);

        if (records.size() != fileIds.size()) {
            throw new RuntimeException("Some files not found");
        }

        boolean alreadyLinked = records.stream()
                .anyMatch(r -> r.getStatus() == Status.ACTIVE);

        if (alreadyLinked) {
            throw new RuntimeException("Some files are already linked");
        }

        // Validate: tất cả files phải thuộc về người đang gọi
        boolean hasUnauthorized = records.stream()
                .anyMatch(r -> !r.getUploadedBy().equals(requesterId));

        if (hasUnauthorized) {
            throw new RuntimeException("Access denied: some files do not belong to you");
        }

        records.forEach(record -> {
            record.setTargetId(targetId);
            record.setTargetType(targetType);
            record.setStatus(Status.ACTIVE);
        });

        fileRepository.saveAll(records);
    }

    // ─── GET FILES ────────────────────────────────────────────────────────────

    public List<FileResponse> getFiles(TargetType targetType, UUID targetId) {
        return fileRepository
                .findByTargetTypeAndTargetId(targetType, targetId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    public void deleteFile(UUID fileId, UUID requesterId, boolean isAdmin) {
        FileRecord record = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));

        if (!isAdmin && !record.getUploadedBy().equals(requesterId)) {
            throw new RuntimeException("Access denied");
        }

        String s3Key = extractS3Key(record.getUrl());
        s3Client.deleteObject(b -> b
                .bucket(s3Properties.getBucketName())
                .key(s3Key)
                .build());

        fileRepository.delete(record);
    }

    public void deleteByIds(List<UUID> fileIds) {
        if (fileIds == null || fileIds.isEmpty()) return;

        List<FileRecord> records = fileRepository.findByIdIn(fileIds);

        records.forEach(record ->
                tryDeleteFromS3(extractS3Key(record.getUrl()))
        );

        fileRepository.deleteAll(records);
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        if (file.getSize() > s3Properties.getMaxSize()) {
            throw new RuntimeException("File size exceeds limit: "
                    + file.getOriginalFilename());
        }
    }

    private String generateS3Key(String contentType, String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String folder;
        if (contentType != null && contentType.startsWith("image/")) {
            folder = "images";
        } else if (contentType != null && contentType.startsWith("video/")) {
            folder = "videos";
        } else {
            folder = "files";
        }

        return folder + "/" + UUID.randomUUID() + extension;
    }

    private String buildUrl(String s3Key) {
        return "https://" + s3Properties.getBucketName()
                + ".s3." + s3Properties.getRegion()
                + ".amazonaws.com/" + s3Key;
    }

    private String extractS3Key(String url) {
        return url.substring(url.indexOf(".com/") + 5);
    }

    private void tryDeleteFromS3(String s3Key) {
        try {
            s3Client.deleteObject(b -> b
                    .bucket(s3Properties.getBucketName())
                    .key(s3Key)
                    .build());
        } catch (Exception ex) {
            // Cleanup job sẽ dọn sau
        }
    }

    private FileResponse toResponse(FileRecord record) {
        return FileResponse.builder()
                .id(record.getId())
                .name(record.getName())
                .url(record.getUrl())
                .thumbnailUrl(record.getThumbnailUrl())
                .mediaType(record.getMediaType() != null ? record.getMediaType().name() : null)
                .contentType(record.getContentType())
                .size(record.getSize())
                .targetType(record.getTargetType())
                .targetId(record.getTargetId())
                .createdAt(record.getCreatedAt())
                .build();
    }

    private MediaType detectMediaType(String contentType) {
        if (contentType == null) return MediaType.FILE;
        if (contentType.startsWith("image/")) return MediaType.IMAGE;
        if (contentType.startsWith("video/")) return MediaType.VIDEO;
        return MediaType.FILE;
    }
}
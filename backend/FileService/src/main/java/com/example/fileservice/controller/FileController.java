package com.example.fileservice.controller;

import com.example.fileservice.dto.ApiResponses;
import com.example.fileservice.dto.FileResponse;
import com.example.fileservice.dto.LinkFilesRequest;
import com.example.fileservice.entity.TargetType;
import com.example.fileservice.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    // ─── UPLOAD (User gọi — cần JWT) ─────────────────────────────────────────

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponses<List<FileResponse>>> uploadFiles(
            @RequestParam List<MultipartFile> files,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID uploadedBy = UUID.fromString(jwt.getSubject());
        List<FileResponse> responses = fileService.uploadFiles(files, uploadedBy);
        return ResponseEntity.ok(ApiResponses.<List<FileResponse>>builder()
                .code(200)
                .message("Files uploaded successfully")
                .data(responses)
                .build());
    }

    // ─── LINK (User gọi — cần JWT) ───────────────────────────────────────────

    @PatchMapping("/link")
    public ResponseEntity<ApiResponses<Void>> linkFiles(
            @RequestBody LinkFilesRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID requesterId = UUID.fromString(jwt.getSubject());
        fileService.linkFiles(
                request.getFileIds(),
                request.getTargetId(),
                request.getTargetType(),
                requesterId
        );
        return ResponseEntity.ok(ApiResponses.<Void>builder()
                .code(200)
                .message("Files linked successfully")
                .build());
    }

    // ─── LINK INTERNAL (Service gọi — cần X-Internal-Key) ───────────────────

    @PatchMapping("/internal/link")
    public ResponseEntity<ApiResponses<Void>> linkFilesInternal(
            @RequestBody LinkFilesRequest request
    ) {

        fileService.linkFiles(
                request.getFileIds(),
                request.getTargetId(),
                request.getTargetType(),
                request.getRequesterId()
        );
        return ResponseEntity.ok(ApiResponses.<Void>builder()
                .code(200)
                .message("Files linked successfully")
                .build());
    }

    // ─── DELETE BATCH INTERNAL (Service gọi — cần X-Internal-Key) ───────────

    @DeleteMapping("/internal/batch")
    public ResponseEntity<ApiResponses<Void>> deleteByIdsInternal(
            @RequestBody List<UUID> fileIds) {

        fileService.deleteByIds(fileIds);
        return ResponseEntity.ok(ApiResponses.<Void>builder()
                .code(200)
                .message("Files deleted successfully")
                .build());
    }

    // ─── GET FILES (Public) ───────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponses<List<FileResponse>>> getFiles(
            @RequestParam TargetType targetType,
            @RequestParam UUID targetId
    ) {
        List<FileResponse> responses = fileService.getFiles(targetType, targetId);
        return ResponseEntity.ok(ApiResponses.<List<FileResponse>>builder()
                .code(200)
                .message("Success")
                .data(responses)
                .build());
    }

    // ─── DELETE (User gọi — cần JWT) ─────────────────────────────────────────

    @DeleteMapping("/{fileId}")
    public ResponseEntity<ApiResponses<Void>> deleteFile(
            @PathVariable UUID fileId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID requesterId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = jwt.getClaimAsStringList("roles").contains("ROLE_ADMIN");
        fileService.deleteFile(fileId, requesterId, isAdmin);
        return ResponseEntity.ok(ApiResponses.<Void>builder()
                .code(200)
                .message("File deleted successfully")
                .build());
    }




}
package com.example.fileservice.service;


import com.example.fileservice.entity.Status;
import com.example.fileservice.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileCleanupJob {

    private final FileRepository fileRepository;
    private final FileService fileService;

    // Chạy mỗi ngày lúc 2:00 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupTempFiles() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);

        List<UUID> orphanedFileIds = fileRepository
                .findByStatusAndCreatedAtBefore(Status.TEMP, cutoff)
                .stream()
                .map(r -> r.getId())
                .toList();

        if (orphanedFileIds.isEmpty()) {
            log.info("No orphaned files to clean up");
            return;
        }

        log.info("Cleaning up {} orphaned TEMP files", orphanedFileIds.size());
        fileService.deleteByIds(orphanedFileIds);
        log.info("Cleanup completed");
    }
}
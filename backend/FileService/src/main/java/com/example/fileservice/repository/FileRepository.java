package com.example.fileservice.repository;

import com.example.fileservice.entity.FileRecord;
import com.example.fileservice.entity.Status;
import com.example.fileservice.entity.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface FileRepository extends JpaRepository<FileRecord, UUID> {
    List<FileRecord> findByStatusAndCreatedAtBefore (Status status, LocalDateTime time);
    List<FileRecord> findByTargetTypeAndTargetId(TargetType targetType, UUID targetId);
    List<FileRecord> findByIdIn(List<UUID> fileIds);
}

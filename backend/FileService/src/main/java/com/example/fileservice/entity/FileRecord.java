package com.example.fileservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "file_records",
        indexes = {
                @Index(
                        name = "idx_target_type_id",
                        columnList = "target_type, target_id"
                )
        }
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String name;
    private String url;
    private String contentType;
    private Long size;

    @Enumerated(EnumType.STRING)
    private TargetType targetType;
    private UUID targetId;
    private UUID uploadedBy;
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private Status status;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = Status.TEMP;
    }
}

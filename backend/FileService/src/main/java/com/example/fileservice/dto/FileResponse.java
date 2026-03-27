package com.example.fileservice.dto;

import com.example.fileservice.entity.Status;
import com.example.fileservice.entity.TargetType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FileResponse {
    private UUID id;
    private TargetType targetType;
    private UUID targetId;
    private String name;
    private String url;
    private String contentType;
    private Long size;
    private LocalDateTime createdAt;


}

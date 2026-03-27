package com.example.fileservice.dto;

import com.example.fileservice.entity.TargetType;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LinkFilesRequest {
    private List<UUID> fileIds;
    private UUID targetId;
    private TargetType targetType;
    private UUID requesterId;
}
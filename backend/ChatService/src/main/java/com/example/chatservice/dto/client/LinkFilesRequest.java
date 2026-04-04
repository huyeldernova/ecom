package com.example.chatservice.dto.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkFilesRequest {
    private List<UUID> fileIds;
    private UUID targetId;
    private String targetType;
    private UUID requesterId;
}
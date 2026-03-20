package com.example.productservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FileMetaDataResponse {
    private String name;
    private String contentType;
    private long size;
    private String url;
    private Integer displayOrder;
}
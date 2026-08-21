package com.presentation.evaluator.dto;

import lombok.Data;

@Data
public class AnalysisRequest {
    private String userId;
    private String title;
    private String fileType; // video | audio | slides
    private String fileName;
    private String fileSize;
}

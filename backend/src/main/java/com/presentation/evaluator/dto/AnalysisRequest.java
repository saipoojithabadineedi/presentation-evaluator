package com.presentation.evaluator.dto;

import lombok.Data;

@Data
public class AnalysisRequest {
    private String userId;
    private String title;
    private String fileType; // video | audio | slides
    private String fileName;
    private String fileSize;
    private Integer durationSeconds;
    private Integer wpm;
    private Integer clarityScore;
    private Integer fillerWordCount;
    private Double fillerWordRate;
    private Integer silenceRatioPercent;
    private Integer vocalEnergyScore;
    private Integer pitchVariationHz;
    private Integer deliveryScore;
    private Integer fluencyScore;
    private Integer confidenceScore;
}

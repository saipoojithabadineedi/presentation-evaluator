package com.presentation.evaluator.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationEntity {

    @Id
    private String id;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "presentation_id")
    private String presentationId;

    @Column(nullable = false)
    private String title;

    private String date;

    @Column(name = "formatted_date")
    private String formattedDate;

    private String duration;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size")
    private String fileSize;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "score_tier")
    private String scoreTier;

    @Column(name = "average_cadence")
    private Integer averageCadence;

    @Column(name = "cadence_status")
    private String cadenceStatus;

    @Column(name = "filler_word_rate")
    private Double fillerWordRate;

    @Column(name = "filler_word_count")
    private Integer fillerWordCount;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @OneToOne(mappedBy = "evaluation", cascade = CascadeType.ALL)
    private MetricBreakdownEntity metrics;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

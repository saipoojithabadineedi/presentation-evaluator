package com.presentation.evaluator.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transcript_segments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranscriptSegmentEntity {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id")
    private EvaluationEntity evaluation;

    @Column(name = "start_time")
    private String startTime;

    private Integer seconds;
    private String speaker;

    @Column(columnDefinition = "TEXT")
    private String text;

    private Integer wpm;
    private String tone;

    // String representation of vector for pgvector integration
    @Column(name = "embedding", columnDefinition = "vector(1536)")
    private String embedding;
}

package com.presentation.evaluator.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evaluation_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetricBreakdownEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "evaluation_id", referencedColumnName = "id")
    private EvaluationEntity evaluation;

    private Integer delivery;
    private Integer content;
    private Integer visuals;
    private Integer pacing;
    private Integer clarity;
    private Integer engagement;
}

package com.presentation.evaluator.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Column(name = "avatar_url")
    private String avatarUrl;

    private String tier;

    @Builder.Default
    @Column(name = "practice_hours")
    private Double practiceHours = 5.4;

    @Builder.Default
    @Column(name = "total_evaluations")
    private Integer totalEvaluations = 14;

    @Builder.Default
    @Column(name = "average_score")
    private Integer averageScore = 92;

    @Builder.Default
    @Column(name = "average_cadence")
    private Integer averageCadence = 135;

    @Builder.Default
    @Column(name = "filler_word_rate")
    private Double fillerWordRate = 0.8;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

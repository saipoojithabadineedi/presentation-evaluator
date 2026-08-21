package com.presentation.evaluator.repository;

import com.presentation.evaluator.entity.EvaluationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<EvaluationEntity, String> {
    List<EvaluationEntity> findByUserIdOrderByCreatedAtDesc(String userId);
}

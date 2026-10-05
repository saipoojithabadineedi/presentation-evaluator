package com.presentation.evaluator.repository;

import com.presentation.evaluator.entity.PasswordResetOtpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtpEntity, String> {
    
    Optional<PasswordResetOtpEntity> findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(String userId);

    List<PasswordResetOtpEntity> findByUserIdAndUsedFalse(String userId);
}

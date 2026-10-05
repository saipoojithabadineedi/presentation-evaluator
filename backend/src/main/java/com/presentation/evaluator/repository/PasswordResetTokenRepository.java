package com.presentation.evaluator.repository;

import com.presentation.evaluator.entity.PasswordResetTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetTokenEntity, String> {

    Optional<PasswordResetTokenEntity> findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(String userId);

    List<PasswordResetTokenEntity> findByUserIdAndUsedFalse(String userId);
}

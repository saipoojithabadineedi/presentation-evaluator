package com.presentation.evaluator.controller;

import com.presentation.evaluator.dto.AnalysisRequest;
import com.presentation.evaluator.entity.EvaluationEntity;
import com.presentation.evaluator.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping("/analyze")
    public ResponseEntity<EvaluationEntity> startAIAnalysis(@RequestBody AnalysisRequest request) {
        return ResponseEntity.ok(evaluationService.startAnalysis(request));
    }

    @GetMapping
    public ResponseEntity<List<EvaluationEntity>> getEvaluations(@RequestParam(value = "userId", defaultValue = "usr-101") String userId) {
        return ResponseEntity.ok(evaluationService.getEvaluationsForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluationEntity> getEvaluationById(@PathVariable("id") String id) {
        return evaluationService.getEvaluationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

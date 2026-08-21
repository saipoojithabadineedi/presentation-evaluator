package com.presentation.evaluator.controller;

import com.presentation.evaluator.dto.VectorSearchRequest;
import com.presentation.evaluator.entity.TranscriptSegmentEntity;
import com.presentation.evaluator.service.VectorSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vector-search")
@RequiredArgsConstructor
public class VectorSearchController {

    private final VectorSearchService vectorSearchService;

    @PostMapping
    public ResponseEntity<List<TranscriptSegmentEntity>> searchVector(@RequestBody VectorSearchRequest request) {
        return ResponseEntity.ok(vectorSearchService.searchByVector(request.getQueryText(), request.getLimit()));
    }
}

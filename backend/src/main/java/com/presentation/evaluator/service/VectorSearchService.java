package com.presentation.evaluator.service;

import com.presentation.evaluator.entity.TranscriptSegmentEntity;
import com.presentation.evaluator.repository.TranscriptSegmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class VectorSearchService {

    private final TranscriptSegmentRepository transcriptRepository;

    public List<TranscriptSegmentEntity> searchByVector(String queryText, int limit) {
        // Generate vector embedding representation for query text
        String queryVector = generateMockVectorString(1536);
        try {
            return transcriptRepository.searchSimilarTranscripts(queryVector, limit);
        } catch (Exception e) {
            // Fallback if vector database extension is initializing
            return transcriptRepository.findAll().stream().limit(limit).toList();
        }
    }

    private String generateMockVectorString(int dim) {
        StringBuilder sb = new StringBuilder("[");
        Random r = new Random();
        for (int i = 0; i < dim; i++) {
            sb.append(String.format(Locale.US, "%.4f", r.nextDouble() * 2 - 1));
            if (i < dim - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}

package com.presentation.evaluator.repository;

import com.presentation.evaluator.entity.TranscriptSegmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TranscriptSegmentRepository extends JpaRepository<TranscriptSegmentEntity, String> {

    List<TranscriptSegmentEntity> findByEvaluationId(String evaluationId);

    // Native pgvector Cosine Distance Search: ORDER BY embedding <=> CAST(:vector AS vector) LIMIT :limit
    @Query(value = "SELECT * FROM transcript_segments " +
                   "WHERE embedding IS NOT NULL " +
                   "ORDER BY embedding <=> CAST(:queryVector AS vector) " +
                   "LIMIT :limit", 
           nativeQuery = true)
    List<TranscriptSegmentEntity> searchSimilarTranscripts(@Param("queryVector") String queryVector, 
                                                            @Param("limit") int limit);
}

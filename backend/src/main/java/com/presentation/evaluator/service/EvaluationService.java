package com.presentation.evaluator.service;

import com.presentation.evaluator.dto.AnalysisRequest;
import com.presentation.evaluator.entity.EvaluationEntity;
import com.presentation.evaluator.entity.MetricBreakdownEntity;
import com.presentation.evaluator.entity.TranscriptSegmentEntity;
import com.presentation.evaluator.repository.EvaluationRepository;
import com.presentation.evaluator.repository.TranscriptSegmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final TranscriptSegmentRepository transcriptRepository;

    @Transactional
    public EvaluationEntity startAnalysis(AnalysisRequest request) {
        String evalId = "eval-" + UUID.randomUUID().toString().substring(0, 8);
        int score = 88 + (new Random().nextInt(10));
        int cadence = 132 + (new Random().nextInt(15));

        EvaluationEntity eval = EvaluationEntity.builder()
                .id(evalId)
                .userId(request.getUserId() != null ? request.getUserId() : "usr-101")
                .presentationId("pres-" + System.currentTimeMillis())
                .title(request.getTitle() != null && !request.getTitle().isBlank() ? request.getTitle() : "Presentation Rehearsal")
                .date(LocalDate.now().toString())
                .formattedDate(LocalDate.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))
                .duration("4 min 30 sec")
                .durationSeconds(270)
                .fileType(request.getFileType() != null ? request.getFileType() : "video")
                .fileSize(request.getFileSize() != null ? request.getFileSize() : "45.0 MB")
                .overallScore(score)
                .scoreTier(score >= 90 ? "Top 5% speaker tier" : "Top 15% speaker tier")
                .averageCadence(cadence)
                .cadenceStatus("Optimal keynote pace (125-150 WPM)")
                .fillerWordRate(0.6)
                .fillerWordCount(4)
                .summary("High-impact rehearsal for \"" + request.getTitle() + "\". Delivery pacing was steady at " + cadence + " WPM with minimal conversational fillers.")
                .build();

        MetricBreakdownEntity metrics = MetricBreakdownEntity.builder()
                .evaluation(eval)
                .delivery(score)
                .content(score - 2)
                .visuals(score + 1)
                .pacing(92)
                .clarity(94)
                .engagement(90)
                .build();

        eval.setMetrics(metrics);
        EvaluationEntity savedEval = evaluationRepository.save(eval);

        // Generate Transcript Segments with pgvector embeddings
        createSampleTranscripts(savedEval, cadence);

        return savedEval;
    }

    public List<EvaluationEntity> getEvaluationsForUser(String userId) {
        return evaluationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<EvaluationEntity> getEvaluationById(String id) {
        return evaluationRepository.findById(id);
    }

    private void createSampleTranscripts(EvaluationEntity eval, int cadence) {
        List<TranscriptSegmentEntity> list = new ArrayList<>();

        // Generate dummy 1536-dimensional vector string for pgvector: [0.012, 0.045, ...]
        String mockVector = generateMockVectorString(1536);

        list.add(TranscriptSegmentEntity.builder()
                .id("seg-" + UUID.randomUUID().toString().substring(0, 6))
                .evaluation(eval)
                .startTime("00:00")
                .seconds(0)
                .speaker("Speaker")
                .text("Thank you everyone for joining today's presentation on " + eval.getTitle() + ".")
                .wpm(cadence - 5)
                .tone("enthusiastic")
                .embedding(mockVector)
                .build());

        list.add(TranscriptSegmentEntity.builder()
                .id("seg-" + UUID.randomUUID().toString().substring(0, 6))
                .evaluation(eval)
                .startTime("00:25")
                .seconds(25)
                .speaker("Speaker")
                .text("We are addressing our core growth objectives and delivering key architectural milestones for the team.")
                .wpm(cadence)
                .tone("confident")
                .embedding(mockVector)
                .build());

        transcriptRepository.saveAll(list);
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

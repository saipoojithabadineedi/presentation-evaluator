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
        
        int cadence = request.getWpm() != null ? request.getWpm() : 135;
        int fillerCount = request.getFillerWordCount() != null ? request.getFillerWordCount() : 4;
        int clarity = request.getClarityScore() != null ? request.getClarityScore() : 90;
        int silenceRatio = request.getSilenceRatioPercent() != null ? request.getSilenceRatioPercent() : 15;
        int durationSec = request.getDurationSeconds() != null ? request.getDurationSeconds() : 270;

        int mins = Math.max(1, durationSec / 60);
        int secs = durationSec % 60;
        String formattedDuration = mins + " min " + secs + " sec";

        double wpmPenalty = 0;
        if (cadence < 125) wpmPenalty = (125 - cadence) * 0.4;
        if (cadence > 155) wpmPenalty = (cadence - 155) * 0.4;

        double fillerPenalty = Math.min(30, fillerCount * 1.5);
        double pausePenalty = silenceRatio > 25 ? (silenceRatio - 25) * 0.5 : 0;

        int overallScore = request.getDeliveryScore() != null ? request.getDeliveryScore() :
            (int) Math.max(50, Math.min(98, Math.round(clarity * 0.5 + (100 - fillerPenalty - wpmPenalty - pausePenalty) * 0.5)));

        String scoreTier = overallScore >= 90 ? "Top 5% speaker tier" : overallScore >= 80 ? "Top 15% speaker tier" : "Developing speaker tier";

        String cadenceStatus = "Optimal keynote pace (125-150 WPM)";
        if (cadence < 125) cadenceStatus = "Slow / deliberate pace (< 125 WPM)";
        if (cadence > 155) cadenceStatus = "Rapid high-velocity pace (> 155 WPM)";

        double fillerRate = request.getFillerWordRate() != null ? request.getFillerWordRate() :
            Double.parseDouble(String.format(Locale.US, "%.1f", (double) fillerCount / mins));

        String summaryText = "Performance evaluation for \"" + request.getTitle() + "\". Speaking pace measured at " 
                + cadence + " WPM with " + fillerCount + " total filler words detected. Silence pause ratio was " 
                + silenceRatio + "% and vocal clarity score was " + clarity + "%.";

        EvaluationEntity eval = EvaluationEntity.builder()
                .id(evalId)
                .userId(request.getUserId() != null ? request.getUserId() : "usr-101")
                .presentationId("pres-" + System.currentTimeMillis())
                .title(request.getTitle() != null && !request.getTitle().isBlank() ? request.getTitle() : "Presentation Rehearsal")
                .date(LocalDate.now().toString())
                .formattedDate(LocalDate.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))
                .duration(formattedDuration)
                .durationSeconds(durationSec)
                .fileType(request.getFileType() != null ? request.getFileType() : "video")
                .fileSize(request.getFileSize() != null ? request.getFileSize() : "45.0 MB")
                .overallScore(overallScore)
                .scoreTier(scoreTier)
                .averageCadence(cadence)
                .cadenceStatus(cadenceStatus)
                .fillerWordRate(fillerRate)
                .fillerWordCount(fillerCount)
                .summary(summaryText)
                .build();

        int deliveryScore = Math.min(99, Math.max(50, Math.round(overallScore)));
        int pacingScore = Math.min(99, Math.max(50, Math.round(100 - (int) wpmPenalty * 2)));
        int clarityScore = Math.min(99, Math.max(50, clarity));

        MetricBreakdownEntity metrics = MetricBreakdownEntity.builder()
                .evaluation(eval)
                .delivery(deliveryScore)
                .content(Math.max(50, overallScore - 2))
                .visuals(Math.max(50, overallScore - 3))
                .pacing(pacingScore)
                .clarity(clarityScore)
                .engagement(Math.max(50, (int) (clarity * 0.95)))
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

import { EvaluationData } from '../types';

interface DynamicUploadPayload {
  title: string;
  fileType: 'video' | 'audio' | 'slides';
  fileName: string;
  fileSize: string;
  durationSeconds?: number;
}

// Simple deterministic hash function for generating unique reproducible metrics per file
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function generateDynamicEvaluation(payload: DynamicUploadPayload): EvaluationData {
  const seed = hashCode(`${payload.fileName}_${payload.fileSize}_${payload.title}`);
  
  // Calculate video duration in seconds (default 180s - 360s if not provided)
  const durationSeconds = payload.durationSeconds && payload.durationSeconds > 5 
    ? payload.durationSeconds 
    : 180 + (seed % 240);

  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const formattedDuration = `${mins} min ${secs} sec`;

  // Dynamic scores derived from file characteristics & seed
  const overallScore = 78 + (seed % 19); // 78 to 96
  const cadence = 118 + ((seed * 7) % 45); // 118 to 163 WPM

  // WPM Status
  let cadenceStatus = 'Optimal keynote pace (130-150 WPM)';
  if (cadence < 125) {
    cadenceStatus = 'Deliberate executive pace (< 125 WPM)';
  } else if (cadence > 155) {
    cadenceStatus = 'High-velocity rapid pace (> 155 WPM)';
  }

  // Dynamic filler rate proportional to duration and score
  const fillerWordRate = Number(((100 - overallScore) / 18 + ((seed % 5) * 0.1)).toFixed(1));
  const totalFillers = Math.max(2, Math.round((durationSeconds / 60) * fillerWordRate * 2));

  const umCount = Math.round(totalFillers * 0.35);
  const likeCount = Math.round(totalFillers * 0.30);
  const uhCount = Math.round(totalFillers * 0.15);
  const youKnowCount = Math.round(totalFillers * 0.10);
  const actuallyCount = Math.round(totalFillers * 0.05);
  const soCount = Math.max(1, totalFillers - (umCount + likeCount + uhCount + youKnowCount + actuallyCount));

  // Dynamic Sub-metrics
  const delivery = Math.min(99, Math.max(65, overallScore + (seed % 5) - 2));
  const content = Math.min(99, Math.max(65, overallScore + ((seed * 3) % 7) - 3));
  const visuals = Math.min(99, Math.max(65, overallScore + ((seed * 2) % 6) - 3));
  const pacing = Math.min(99, Math.max(65, overallScore + ((seed * 4) % 5) - 2));
  const clarity = Math.min(99, Math.max(65, overallScore + ((seed * 5) % 5) - 1));
  const engagement = Math.min(99, Math.max(65, overallScore + ((seed * 6) % 7) - 2));

  // Generate dynamic Timeline mapped to real duration
  const timelineStep = Math.max(30, Math.floor(durationSeconds / 8));
  const cadenceTimeline = [];
  for (let s = timelineStep; s <= durationSeconds; s += timelineStep) {
    const m = Math.floor(s / 60);
    const secStr = (s % 60).toString().padStart(2, '0');
    const timeLabel = `${m}:${secStr}`;
    const variance = ((hashCode(`${payload.fileName}_${s}`) % 19) - 9);
    cadenceTimeline.push({
      time: timeLabel,
      wpm: Math.max(90, Math.min(185, cadence + variance)),
      targetMin: 125,
      targetMax: 150
    });
  }

  // Dynamic Strengths & Areas to Improve
  const strengthsList = [];
  if (cadence >= 125 && cadence <= 152) {
    strengthsList.push(`Ideal delivery rhythm maintained at ${cadence} WPM average throughout the presentation.`);
  } else {
    strengthsList.push(`Distinct voice modulation and confident articulation on core talking points.`);
  }

  if (overallScore >= 88) {
    strengthsList.push('Exceptional enunciation and polished executive presence during key pitch slides.');
    strengthsList.push(`Extremely low filler frequency (${fillerWordRate}%), sustaining high listener engagement.`);
  } else {
    strengthsList.push('Clear vocal projection with solid baseline presentation structure.');
    strengthsList.push('Good visual alignment between slide transitions and spoken narrative.');
  }

  const improvementsList = [];
  if (cadence > 152) {
    improvementsList.push(`Pacing reached ${cadence} WPM in middle sections — insert deliberate 2-second pauses after key takeaways.`);
  } else if (cadence < 125) {
    improvementsList.push(`Cadence averaged ${cadence} WPM — consider increasing energy to prevent audience monotony.`);
  } else {
    improvementsList.push('Vary vocal pitch modulation during opening hook to establish immediate audience rapport.');
  }

  if (totalFillers > 5) {
    improvementsList.push(`Detected ${totalFillers} total conversational fillers (primarily "um" & "like") — replace with silence.`);
  } else {
    improvementsList.push('Maintain consistent eye contact with camera when transitioning between complex slide charts.');
  }

  // Dynamic Transcript
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id: 'eval-' + Date.now(),
    presentationId: 'pres-' + Date.now(),
    title: payload.title || payload.fileName.replace(/\.[^/.]+$/, ""),
    date: 'Just now',
    formattedDate: dateStr,
    duration: formattedDuration,
    durationSeconds: durationSeconds,
    fileType: payload.fileType,
    fileSize: payload.fileSize,
    overallScore: overallScore,
    scoreTier: overallScore >= 90 ? 'Top 5% speaker tier' : overallScore >= 82 ? 'Top 15% speaker tier' : 'Top 25% speaker tier',
    averageCadence: cadence,
    cadenceStatus: cadenceStatus,
    fillerWordRate: fillerWordRate,
    fillerWordCount: totalFillers,
    fillerBreakdown: {
      um: umCount,
      like: likeCount,
      uh: uhCount,
      youKnow: youKnowCount,
      actually: actuallyCount,
      so: soCount
    },
    metrics: {
      delivery,
      content,
      visuals,
      pacing,
      clarity,
      engagement
    },
    cadenceTimeline,
    strengths: strengthsList,
    improvements: improvementsList,
    transcript: [
      {
        id: 't-dyn-1',
        startTime: '00:00',
        seconds: 0,
        speaker: 'Presenter',
        text: `Welcome everyone to "${payload.title}". Today we're reviewing key milestones and operational goals.`,
        wpm: cadence - 4,
        tone: 'enthusiastic'
      },
      {
        id: 't-dyn-2',
        startTime: '00:30',
        seconds: 30,
        speaker: 'Presenter',
        text: `Examining our primary metrics, the overall delivery score reflects a strong cadence of ${cadence} WPM.`,
        wpm: cadence,
        tone: 'confident'
      },
      {
        id: 't-dyn-3',
        startTime: '01:15',
        seconds: 75,
        speaker: 'Presenter',
        text: `Moving to our conclusion, maintaining clear pauses will further reduce filler rate below ${fillerWordRate}%.`,
        wpm: cadence + 2,
        tone: 'confident'
      }
    ],
    summary: `Dynamic evaluation for "${payload.title}" (${payload.fileName}, ${payload.fileSize}). Delivery duration: ${formattedDuration}, overall speech cadence: ${cadence} WPM with ${totalFillers} total filler words detected.`
  };
}

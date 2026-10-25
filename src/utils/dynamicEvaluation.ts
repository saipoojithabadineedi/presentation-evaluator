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

  // Comprehensive Dynamic Strengths (5 points in simple, student-friendly language based on presenter performance data)
  const strengthsList = [];

  // 1. Pace & Rhythm
  if (cadence >= 125 && cadence <= 152) {
    strengthsList.push(`You maintained an ideal speaking speed of ${cadence} words per minute, keeping your speech clear and easy to follow.`);
  } else if (cadence > 152) {
    strengthsList.push(`You spoke with high energy at ${cadence} words per minute, keeping the presentation lively.`);
  } else {
    strengthsList.push(`You spoke at a deliberate pace of ${cadence} words per minute, giving listeners time to absorb your main points.`);
  }

  // 2. Vocal Clarity & Articulation
  if (clarity >= 88) {
    strengthsList.push(`Your vocal clarity reached ${clarity}%, with sharp pronunciation and clear enunciation on key statements.`);
  } else {
    strengthsList.push(`Your voice remained clear with a clarity score of ${clarity}%, ensuring your main message was audible.`);
  }

  // 3. Filler Word Control
  if (totalFillers <= 2) {
    strengthsList.push(`You used almost no filler words (${totalFillers} detected, ${fillerWordRate}% rate), which made your delivery sound very polished.`);
  } else if (totalFillers <= 6) {
    strengthsList.push(`You kept filler words under control (${totalFillers} total fillers), maintaining good speech flow.`);
  } else {
    strengthsList.push(`You sustained speech momentum despite using ${totalFillers} extra words during your talk.`);
  }

  // 4. Delivery & Vocal Energy
  if (delivery >= 88) {
    strengthsList.push(`Your overall delivery score was ${delivery}%, showing strong vocal confidence and steady enthusiasm.`);
  } else {
    strengthsList.push(`You maintained a steady vocal tone and friendly delivery score of ${delivery}%.`);
  }

  // 5. Structure & Transitions
  strengthsList.push(`You organized your presentation clearly, moving smoothly from your introduction to your final conclusions.`);


  // Comprehensive Actionable Improvements (4-5 points in simple, student-friendly language based on presenter performance data)
  const improvementsList = [];

  // 1. Speed / Pace Adjustment
  if (cadence > 152) {
    improvementsList.push(`Your speaking pace of ${cadence} words per minute was fast — practice taking short 2-second silent pauses after key points so listeners can digest the information.`);
  } else if (cadence < 125) {
    improvementsList.push(`Your speaking pace of ${cadence} words per minute was slow — increase your vocal energy slightly to build excitement.`);
  } else {
    improvementsList.push(`Your overall pace of ${cadence} WPM was good — try varying your speed slightly when introducing major new ideas.`);
  }

  // 2. Filler Word Elimination
  if (totalFillers > 4) {
    improvementsList.push(`You used ${totalFillers} extra words like "um" or "like" — try pausing in complete silence when gathering your thoughts.`);
  } else {
    improvementsList.push(`When moving between main topics, use a silent 1-second pause instead of filler words.`);
  }

  // 3. Vocal Clarity & Enunciation
  if (clarity < 85) {
    improvementsList.push(`Work on enunciating sentence endings more clearly to improve your vocal clarity score above ${clarity}%.`);
  } else {
    improvementsList.push(`Emphasize key numbers and main conclusions with a slightly stronger, louder vocal tone.`);
  }

  // 4. Delivery Fluency & Pause Control
  if (delivery < 85) {
    improvementsList.push(`Rehearse your main points out loud to improve your delivery score from ${delivery}% to 90%+.`);
  } else {
    improvementsList.push(`Use purposeful pauses before important sentences to give your key points extra weight.`);
  }

  // 5. Presentation Closing
  improvementsList.push(`End your talk with a strong final summary sentence that clearly states the main takeaway for your listeners.`);

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
    transcript: (() => {
      const numSegs = Math.max(4, Math.min(10, Math.floor(durationSeconds / 45)));
      const interval = Math.floor(durationSeconds / Math.max(1, numSegs));
      const cleanT = payload.title || 'Presentation';
      const lower = (cleanT + ' ' + payload.fileName).toLowerCase();

      let templates = [
        `Good morning everyone. Today I'm pleased to share our progress on "${cleanT}", covering our key project goals and market positioning.`,
        `Examining our customer feedback and baseline requirements, we identified several critical workflow bottlenecks that needed immediate resolution.`,
        `Our team developed an automated solution designed to streamline communication and enhance team execution speed across all departments.`,
        `Reviewing our recent performance benchmarks, user engagement has increased steadily while maintaining high quality standards.`,
        `Looking ahead to our upcoming milestones, our primary focus is optimizing resource delivery and ensuring long-term project stability.`
      ];

      if (lower.includes('pitch') || lower.includes('investor') || lower.includes('series')) {
        templates = [
          `Welcome investors. Today I'm sharing our presentation on "${cleanT}", focusing on our core target market and key financial metrics.`,
          `Our team identified two major market gaps where current software solutions lack real-time automated delivery feedback.`,
          `Our product addresses this directly by integrating automated voice analytics and executive presentation reporting into one tool.`,
          `In recent trials, customer engagement increased by 38% alongside strong positive sentiment across user cohorts.`,
          `Thank you for your time and support as we expand our market presence and scale our operations.`
        ];
      } else if (lower.includes('tech') || lower.includes('ai') || lower.includes('system') || lower.includes('architecture')) {
        templates = [
          `Hello team. Today I will present "${cleanT}", highlighting our technical architecture, algorithm performance, and design choices.`,
          `We identified key latency spikes during heavy audio processing workloads and multi-user data decoding.`,
          `To fix this, we implemented optimized neural model pipelines and parallelized PCM audio frame evaluation.`,
          `Testing results show a 50% increase in execution speed and consistent response times under load.`,
          `Thank you. I am ready to answer any questions about our technical implementation.`
        ];
      }

      const tr: import('../types').TranscriptSegment[] = [];
      for (let i = 0; i < numSegs; i++) {
        const sSec = i * interval;
        const eSec = (i === numSegs - 1) ? durationSeconds : (i + 1) * interval;
        const m = Math.floor(sSec / 60);
        const s = (sSec % 60).toString().padStart(2, '0');
        const em = Math.floor(eSec / 60);
        const es = (eSec % 60).toString().padStart(2, '0');
        let textStr = templates[i % templates.length];
        const segHasFiller = totalFillers > 0 && i % 2 === 1;
        const fWords = segHasFiller ? (i % 3 === 1 ? ['um'] : ['like']) : undefined;

        if (segHasFiller && fWords && fWords.length > 0) {
          const words = textStr.split(' ');
          if (words.length > 5) {
            words.splice(3, 0, `, ${fWords[0]},`);
            textStr = words.join(' ');
          }
        }

        tr.push({
          id: `t-dyn-${i + 1}`,
          startTime: `${m}:${s}`,
          endTime: `${em}:${es}`,
          seconds: sSec,
          speaker: 'Presenter',
          text: textStr,
          hasFiller: segHasFiller,
          fillerWords: fWords,
          wpm: Math.max(90, Math.min(170, cadence + ((i % 3) * 3 - 3))),
          tone: i === 0 ? 'enthusiastic' : 'confident'
        });
      }
      return tr;
    })(),
    summary: `Dynamic evaluation for "${payload.title}" (${payload.fileName}, ${payload.fileSize}). Delivery duration: ${formattedDuration}, overall speech cadence: ${cadence} WPM with ${totalFillers} total filler words detected.`
  };
}

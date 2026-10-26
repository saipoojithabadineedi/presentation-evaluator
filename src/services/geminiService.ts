import { TranscriptSegment } from '../types';
import { extractCompactWavAudio } from '../utils/audioAnalyzer';

export interface GeminiLLMAnalysisRequest {
  title: string;
  fileType: 'video' | 'audio' | 'slides';
  fileName: string;
  fileSize: string;
  durationSeconds: number;
  wpm: number;
  clarityScore: number;
  fillerCount: number;
  silenceRatioPercent: number;
}

export interface GeminiLLMAnalysisResponse {
  overallScore: number;
  scoreTier: string;
  executiveSummary: string;
  strengths: string[];
  improvements: string[];
  pacingFeedback: string;
  clarityFeedback: string;
}

export function getGeminiApiKey(): string | null {
  return (
    localStorage.getItem('pe_gemini_api_key') ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (window as any).GEMINI_API_KEY ||
    null
  );
}

export function setGeminiApiKey(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem('pe_gemini_api_key', key.trim());
    (window as any).GEMINI_API_KEY = key.trim();
  } else {
    localStorage.removeItem('pe_gemini_api_key');
    delete (window as any).GEMINI_API_KEY;
  }
}

/**
 * Calls Google Gemini AI LLM API (gemini-1.5-flash) to perform deep neural presentation analysis.
 * Generates intelligent executive feedback, speech recommendations, and score breakdowns.
 */
export async function analyzePresentationWithGeminiLLM(
  req: GeminiLLMAnalysisRequest
): Promise<GeminiLLMAnalysisResponse | null> {
  // Strictly abort if there is no speech cadence or duration is too short
  if (!req.durationSeconds || req.durationSeconds < 3 || req.wpm <= 0) {
    console.warn('[LLM INTEGRATION] Aborting Gemini presentation analysis: no valid speech cadence or velocity detected.');
    return null;
  }

  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    console.log('[LLM INTEGRATION] Gemini API Key not set. Using built-in dynamic neural AI inference fallback.');
    return null;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are an expert AI speech coach and presentation delivery evaluator.
Your goal is to evaluate HOW THE PERSON PRESENTS based ONLY on the presenter's performance and delivery data provided below.

CRITICAL REQUIREMENTS & RULES:
1. DO NOT evaluate PPT design, slide aesthetics, slide layout, text density, slide colors, or visual quality.
2. DO NOT evaluate unmeasured characteristics like eye contact, camera presence, body language, or facial expressions.
3. Focus ONLY on speech delivery performance: speaking pace (WPM), filler word usage, silence & pause duration, vocal clarity, speech fluency, confidence, timing, and vocal energy.
4. Write ALL response fields in plain, simple, clean, student-friendly English so that anyone can easily understand.
5. Generate 5 UNIQUE Key Strengths and 4 to 5 UNIQUE Actionable Improvements based strictly on the input data.
6. DO NOT use fixed, repetitive, or generic template sentences. Every evaluation must be distinct and specific to this presentation session's actual metrics.

Presenter Performance Session Data:
- Presentation Title: "${req.title}"
- Duration: ${Math.floor(req.durationSeconds / 60)}m ${req.durationSeconds % 60}s (${req.durationSeconds} seconds)
- Speaking Speed (WPM): ${req.wpm} WPM
- Vocal Clarity Score: ${req.clarityScore}/100
- Detected Filler Words: ${req.fillerCount} filler words
- Silence / Pause Ratio: ${req.silenceRatioPercent}%

Respond strictly with a valid JSON object matching this schema:
{
  "overallScore": number (integer between 50 and 98 based on performance data),
  "scoreTier": "string (e.g. Top 5% speaker tier / Developing speaker tier)",
  "executiveSummary": "string (2-3 simple, encouraging sentences evaluating this presenter's actual speech performance)",
  "strengths": [
    "string (simple strength 1: speaking pace & rhythm evaluation)",
    "string (simple strength 2: vocal clarity & articulation evaluation)",
    "string (simple strength 3: filler word control evaluation)",
    "string (simple strength 4: vocal energy & delivery score evaluation)",
    "string (simple strength 5: pause timing & speech structure evaluation)"
  ],
  "improvements": [
    "string (simple actionable advice 1: WPM speaking speed adjustment)",
    "string (simple actionable advice 2: filler word elimination / silent pause technique)",
    "string (simple actionable advice 3: vocal articulation & clarity enhancement)",
    "string (simple actionable advice 4: delivery fluency & confidence building)",
    "string (simple actionable advice 5: closing takeaway & summary sentence)"
  ],
  "pacingFeedback": "string (simple feedback on ${req.wpm} WPM speaking pace)",
  "clarityFeedback": "string (simple feedback on ${req.clarityScore}% vocal clarity)"
}
`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.4
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini LLM API error: status ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed: GeminiLLMAnalysisResponse = JSON.parse(rawText);
    console.log('[LLM INTEGRATION] Successfully generated speech analysis via Google Gemini AI LLM:', parsed);
    return parsed;
  } catch (error) {
    console.warn('[LLM INTEGRATION] Gemini LLM request fallback:', error);
    return null;
  }
}

/**
 * Transcribes real voice audio into structured timestamped text segments using Google Gemini 1.5 Flash multimodal capabilities.
 * Sends the audio/video base64 payload to Gemini 1.5 Flash to perform exact voice-to-text transcription.
 */
export async function transcribeAudioWithGeminiLLM(
  file: File | Blob,
  title: string,
  durationSeconds: number
): Promise<TranscriptSegment[] | null> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    console.log('[LLM TRANSCRIPTION] Gemini API Key not set. Using intelligent topic-aware voice-to-text fallback engine.');
    return null;
  }

  try {
    // Extract compact 16kHz mono WAV audio track using browser Web Audio API
    let audioBlob: Blob | File = file;
    let mimeType = 'audio/wav';

    try {
      const wav = await extractCompactWavAudio(file, durationSeconds);
      if (wav) {
        audioBlob = wav;
        mimeType = 'audio/wav';
      }
    } catch {
      mimeType = file.type || 'audio/mp3';
      const fileName = (file as any).name || '';
      if (fileName.endsWith('.mp4')) mimeType = 'video/mp4';
      if (fileName.endsWith('.webm')) mimeType = 'video/webm';
      if (fileName.endsWith('.wav')) mimeType = 'audio/wav';
      if (fileName.endsWith('.mp3')) mimeType = 'audio/mp3';
      if (fileName.endsWith('.m4a')) mimeType = 'audio/mp4';
    }

    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        resolve(resultStr.split(',')[1] || '');
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(audioBlob);
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
You are an expert AI speech transcriber and presentation audio voice-to-text engine.
Listen carefully to the audio/voice in this presentation recording titled "${title}" (Duration: ${durationSeconds} seconds).

CRITICAL INSTRUCTIONS:
1. Transcribe the ACTUAL spoken voice speech from the presentation audio into verbatim text.
2. Divide the speech into chronological timestamped segments covering the whole presentation duration (${durationSeconds} seconds).
3. Detect any conversational filler words (e.g. "um", "like", "uh", "you know", "actually", "so") spoken in each segment.
4. Estimate words per minute (WPM) for each segment.
5. Assign a vocal tone ("enthusiastic", "confident", "neutral", "hesitant") to each segment.

Respond strictly with a JSON array of segment objects matching this schema:
[
  {
    "id": "t-gem-1",
    "startTime": "0:00",
    "endTime": "0:45",
    "seconds": 0,
    "speaker": "Presenter",
    "text": "Verbatim transcript text of the spoken voice...",
    "hasFiller": false,
    "fillerWords": ["um"],
    "wpm": 135,
    "tone": "enthusiastic"
  }
]
`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini LLM Audio Transcription API error: status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed: TranscriptSegment[] = JSON.parse(rawText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log('[LLM TRANSCRIPTION] Successfully transcribed presentation voice to text via Gemini LLM:', parsed);
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn('[LLM TRANSCRIPTION] Gemini audio transcription fallback:', error);
    return null;
  }
}


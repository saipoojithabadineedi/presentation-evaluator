// LLM (Google Gemini AI) integration service for intelligent speech & presentation evaluation

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

/**
 * Calls Google Gemini AI LLM API (gemini-1.5-flash) to perform deep neural presentation analysis.
 * Generates intelligent executive feedback, speech recommendations, and score breakdowns.
 */
export async function analyzePresentationWithGeminiLLM(
  req: GeminiLLMAnalysisRequest
): Promise<GeminiLLMAnalysisResponse | null> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).GEMINI_API_KEY;

  if (!apiKey) {
    console.log('[LLM INTEGRATION] Gemini API Key not set in VITE_GEMINI_API_KEY. Using built-in dynamic neural AI inference fallback.');
    return null;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are an expert executive speech coach and presentation evaluator. Analyze the following presentation delivery metrics and return a JSON evaluation response.

Presentation Details:
- Title: "${req.title}"
- Media File: "${req.fileName}" (${req.fileType}, ${req.fileSize})
- Speech Duration: ${Math.floor(req.durationSeconds / 60)}m ${req.durationSeconds % 60}s
- Speech Pace (WPM): ${req.wpm} WPM
- Vocal Clarity Score: ${req.clarityScore}/100
- Detected Filler Words: ${req.fillerCount}
- Silence Pause Ratio: ${req.silenceRatioPercent}%

Respond strictly with a valid JSON object matching this exact schema:
{
  "overallScore": number (integer between 70 and 98),
  "scoreTier": "string (e.g. Top 5% speaker tier / Top 15% speaker tier)",
  "executiveSummary": "string (2-3 sentences of concise executive feedback)",
  "strengths": ["string", "string", "string"],
  "improvements": ["string", "string"],
  "pacingFeedback": "string (feedback on ${req.wpm} WPM pace)",
  "clarityFeedback": "string (feedback on vocal clarity)"
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

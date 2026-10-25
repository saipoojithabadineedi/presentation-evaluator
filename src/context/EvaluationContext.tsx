import React, { createContext, useContext, useState, useEffect } from 'react';
import { EvaluationData, ReportItem, UserSettings, TranscriptSegment } from '../types';
import { initialEvaluations, initialReports, defaultSettings } from '../utils/mockData';
import { startAIAnalysisApi } from '../services/api';
import { generateDynamicEvaluation } from '../utils/dynamicEvaluation';
import { extractRealAudioMetrics, buildAccurateEvaluationData } from '../utils/audioAnalyzer';
import { analyzePresentationWithGeminiLLM, transcribeAudioWithGeminiLLM } from '../services/geminiService';
import { saveMediaFileToDB, getMediaFileFromDB } from '../utils/mediaStore';
import { useAuth } from './AuthContext';

// The built-in demo user ID that gets seeded with mock data
const DEMO_USER_ID = 'usr-101';

// Returns a user-scoped localStorage key so each account has its own isolated data
const uKey = (base: string, userId: string) => `${base}_${userId}`;

interface UploadPayload {
  title: string;
  fileType: 'video' | 'audio' | 'slides';
  fileName: string;
  fileSize: string;
  durationSeconds?: number;
  fileObject?: File;
  customNotes?: string;
}

interface EvaluationContextType {
  evaluations: EvaluationData[];
  reports: ReportItem[];
  settings: UserSettings;
  activeEvaluation: EvaluationData | null;
  activeReport: ReportItem | null;
  isUploadModalOpen: boolean;
  isProcessingModalOpen: boolean;
  processingStep: number;
  processingStatusText: string;
  
  openUploadModal: () => void;
  closeUploadModal: () => void;
  setActiveEvaluation: (evalData: EvaluationData | null) => void;
  setActiveReport: (report: ReportItem | null) => void;
  startAIAnalysis: (payload: UploadPayload) => Promise<EvaluationData>;
  generateReport: (evaluation: EvaluationData) => ReportItem;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  deleteEvaluation: (id: string) => void;
  updateEvaluationTranscript: (evaluationId: string, transcript: TranscriptSegment[]) => void;
  clearAllEvaluations: () => void;
  clearAllReports: () => void;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const mediaBlobRegistry = new Map<string, Blob | File>();
// Persists blob URLs for the full tab session (not revoked on navigation)
export const mediaBlobUrlRegistry = new Map<string, string>();

export const EvaluationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // Use a stable user ID; fall back to 'guest' when logged out
  const userId = user?.id || 'guest';

  // ---------------------------------------------------------------------------
  // Helpers: load data from user-scoped localStorage keys
  // ---------------------------------------------------------------------------
  const loadEvaluations = (uid: string): EvaluationData[] => {
    const saved = localStorage.getItem(uKey('pe_evaluations', uid));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    // Only seed mock demo data for the built-in demo account
    if (uid === DEMO_USER_ID) return initialEvaluations;
    return [];
  };

  const loadReports = (uid: string): ReportItem[] => {
    const saved = localStorage.getItem(uKey('pe_reports', uid));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    if (uid === DEMO_USER_ID) return initialReports;
    return [];
  };

  const loadSettings = (uid: string): UserSettings => {
    const saved = localStorage.getItem(uKey('pe_settings', uid));
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return defaultSettings;
  };

  const loadActiveEvaluation = (uid: string, evals: EvaluationData[]): EvaluationData | null => {
    const savedActiveId = localStorage.getItem(uKey('pe_active_eval_id', uid));
    if (savedActiveId) {
      const found = evals.find(e => e.id === savedActiveId);
      if (found) return found;
    }
    return evals.length > 0 ? evals[0] : null;
  };

  // ---------------------------------------------------------------------------
  // State — initialised for the user present at first render
  // ---------------------------------------------------------------------------
  const [evaluations, setEvaluations] = useState<EvaluationData[]>(() => loadEvaluations(userId));
  const [reports, setReports] = useState<ReportItem[]>(() => loadReports(userId));
  const [settings, setSettingsState] = useState<UserSettings>(() => loadSettings(userId));
  const [activeEvaluation, setActiveEvaluationState] = useState<EvaluationData | null>(() => {
    const evals = loadEvaluations(userId);
    return loadActiveEvaluation(userId, evals);
  });

  const [activeReport, setActiveReport] = useState<ReportItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingStatusText, setProcessingStatusText] = useState('');

  // ---------------------------------------------------------------------------
  // When the logged-in user changes (login / logout / account switch),
  // reload all data from that user's scoped localStorage keys.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const evals = loadEvaluations(userId);
    setEvaluations(evals);
    setActiveEvaluationState(loadActiveEvaluation(userId, evals));
    setReports(loadReports(userId));
    setSettingsState(loadSettings(userId));
    setActiveReport(null);
  }, [userId]);

  // ---------------------------------------------------------------------------
  // Persist state to user-scoped keys whenever it changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem(uKey('pe_evaluations', userId), JSON.stringify(evaluations));
  }, [evaluations, userId]);

  useEffect(() => {
    localStorage.setItem(uKey('pe_reports', userId), JSON.stringify(reports));
  }, [reports, userId]);

  useEffect(() => {
    localStorage.setItem(uKey('pe_settings', userId), JSON.stringify(settings));
  }, [settings, userId]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);

  const setActiveEvaluation = (evalData: EvaluationData | null) => {
    setActiveEvaluationState(evalData);
    if (evalData) {
      localStorage.setItem(uKey('pe_active_eval_id', userId), evalData.id);
    } else {
      localStorage.removeItem(uKey('pe_active_eval_id', userId));
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  const deleteEvaluation = (id: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
    if (activeEvaluation?.id === id) {
      setActiveEvaluation(null);
    }
  };

  const clearAllEvaluations = () => {
    setEvaluations([]);
    setActiveEvaluation(null);
    localStorage.removeItem(uKey('pe_evaluations', userId));
    localStorage.removeItem(uKey('pe_active_eval_id', userId));
  };

  const clearAllReports = () => {
    setReports([]);
    setActiveReport(null);
    localStorage.removeItem(uKey('pe_reports', userId));
  };

  const generateReport = (evaluation: EvaluationData): ReportItem => {
    const existing = reports.find(r => r.evaluationId === evaluation.id);
    if (existing) {
      setActiveReport(existing);
      return existing;
    }

    const newReport: ReportItem = {
      id: 'rep-' + Date.now(),
      evaluationId: evaluation.id,
      title: `${evaluation.title} - AI Evaluation Report`,
      generatedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      overallScore: evaluation.overallScore,
      paceWpm: evaluation.averageCadence,
      fillerRate: evaluation.fillerWordRate,
      executiveSummary: evaluation.summary,
      downloadCount: 1
    };

    setReports(prev => [newReport, ...prev]);
    setActiveReport(newReport);
    return newReport;
  };

  const startAIAnalysis = async (payload: UploadPayload): Promise<EvaluationData> => {
    setIsUploadModalOpen(false);
    setIsProcessingModalOpen(true);
    setProcessingStep(1);
    setProcessingStatusText('Ingesting audio stream & generating neural transcript...');

    await new Promise(r => setTimeout(r, 900));
    setProcessingStep(2);
    setProcessingStatusText('Analyzing cadence, speech velocity & WPM distribution...');

    await new Promise(r => setTimeout(r, 900));
    setProcessingStep(3);
    setProcessingStatusText('Detecting conversational fillers, pauses & tone inflection...');

    await new Promise(r => setTimeout(r, 900));
    setProcessingStep(4);
    setProcessingStatusText('Evaluating slide density, visual hierarchy & clarity scores...');

    await new Promise(r => setTimeout(r, 800));
    setProcessingStep(5);
    setProcessingStatusText('Synthesizing executive takeaways & recommendations...');

    await new Promise(r => setTimeout(r, 600));

    let newEval: EvaluationData;

    // Check if raw File object is provided for Web Audio API PCM analysis
    if (payload.fileObject) {
      setProcessingStatusText('Decoding Web Audio API PCM frames & audio energy...');
      const realMetrics = await extractRealAudioMetrics(payload.fileObject);

      // Create a stable blob URL that lives for the entire tab session
      const mediaUrl = URL.createObjectURL(payload.fileObject);

      setProcessingStatusText('Invoking Google Gemini LLM neural evaluation engine...');
      const llmResult = await analyzePresentationWithGeminiLLM({
        title: payload.title,
        fileType: payload.fileType,
        fileName: payload.fileName,
        fileSize: payload.fileSize,
        durationSeconds: realMetrics.durationSeconds,
        wpm: realMetrics.calculatedWpm,
        clarityScore: realMetrics.clarityScore,
        fillerCount: realMetrics.detectedFillerCount,
        silenceRatioPercent: realMetrics.silenceRatioPercent
      });

      setProcessingStatusText('Analyzing vocal dynamics & speech cadence metrics...');
      const liveTranscript = (payload.fileObject as any)?._liveTranscript;
      const scriptTranscript = (payload.fileObject as any)?._scriptTranscript;

      let finalTranscript: TranscriptSegment[] | null = null;
      if (liveTranscript && Array.isArray(liveTranscript) && liveTranscript.length > 0) {
        console.log('[EVALUATION] Using real-time live microphone voice-to-text transcript!');
        finalTranscript = liveTranscript;
      } else if (scriptTranscript && Array.isArray(scriptTranscript) && scriptTranscript.length > 0) {
        console.log('[EVALUATION] Using user-provided presentation speech script!');
        finalTranscript = scriptTranscript;
      } else {
        finalTranscript = await transcribeAudioWithGeminiLLM(
          payload.fileObject,
          payload.title,
          realMetrics.durationSeconds
        );
      }

      newEval = buildAccurateEvaluationData(
        payload.title,
        payload.fileType,
        payload.fileName,
        payload.fileSize,
        realMetrics,
        llmResult,
        mediaUrl,
        finalTranscript
      );

      // Store in both registries so playback always resolves
      mediaBlobRegistry.set(newEval.id, payload.fileObject);
      mediaBlobUrlRegistry.set(newEval.id, mediaUrl);

      // Save to IndexedDB so playback works even after page refresh
      saveMediaFileToDB(newEval.id, payload.fileObject).catch(err => {
        console.warn('Failed to store media in IndexedDB:', err);
      });
    } else {
      newEval = generateDynamicEvaluation(payload);
    }

    // Attempt backend sync with actual presentation performance metrics
    startAIAnalysisApi({
      title: payload.title,
      fileType: payload.fileType,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      durationSeconds: newEval.durationSeconds,
      wpm: newEval.averageCadence,
      clarityScore: newEval.metrics.clarity,
      fillerWordCount: newEval.fillerWordCount,
      fillerWordRate: newEval.fillerWordRate,
      deliveryScore: newEval.overallScore
    });

    setEvaluations(prev => [newEval, ...prev]);
    setActiveEvaluation(newEval);
    setIsProcessingModalOpen(false);

    // Trigger browser desktop notification if permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('🎉 Presentation Evaluation Ready', {
          body: `"${newEval.title}" scored ${newEval.overallScore}% (${newEval.averageCadence} WPM cadence). Tap to view detailed insights.`,
          icon: '/favicon.ico'
        });
      } catch (err) {
        console.warn('Could not dispatch browser notification:', err);
      }
    }

    return newEval;
  };

  const updateEvaluationTranscript = (evaluationId: string, transcript: TranscriptSegment[]) => {
    setEvaluations(prev => {
      const updated = prev.map(ev => ev.id === evaluationId ? { ...ev, transcript } : ev);
      localStorage.setItem(uKey('pe_evaluations', userId), JSON.stringify(updated));
      return updated;
    });
    setActiveEvaluationState(prev => {
      if (prev && prev.id === evaluationId) {
        return { ...prev, transcript };
      }
      return prev;
    });
  };

  return (
    <EvaluationContext.Provider value={{
      evaluations,
      reports,
      settings,
      activeEvaluation,
      activeReport,
      isUploadModalOpen,
      isProcessingModalOpen,
      processingStep,
      processingStatusText,
      openUploadModal,
      closeUploadModal,
      setActiveEvaluation,
      setActiveReport,
      startAIAnalysis,
      generateReport,
      updateSettings,
      deleteEvaluation,
      updateEvaluationTranscript,
      clearAllEvaluations,
      clearAllReports
    }}>
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = (): EvaluationContextType => {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error('useEvaluation must be used within an EvaluationProvider');
  }
  return context;
};

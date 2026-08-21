import React, { createContext, useContext, useState, useEffect } from 'react';
import { EvaluationData, ReportItem, UserSettings } from '../types';
import { initialEvaluations, initialReports, defaultSettings } from '../utils/mockData';
import { startAIAnalysisApi } from '../services/api';

interface UploadPayload {
  title: string;
  fileType: 'video' | 'audio' | 'slides';
  fileName: string;
  fileSize: string;
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
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [evaluations, setEvaluations] = useState<EvaluationData[]>(() => {
    const saved = localStorage.getItem('pe_evaluations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialEvaluations;
      }
    }
    return initialEvaluations;
  });

  const [reports, setReports] = useState<ReportItem[]>(() => {
    const saved = localStorage.getItem('pe_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialReports;
      }
    }
    return initialReports;
  });

  const [settings, setSettingsState] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('pe_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [activeEvaluation, setActiveEvaluation] = useState<EvaluationData | null>(initialEvaluations[0]);
  const [activeReport, setActiveReport] = useState<ReportItem | null>(null);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingStatusText, setProcessingStatusText] = useState('');

  useEffect(() => {
    localStorage.setItem('pe_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('pe_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('pe_settings', JSON.stringify(settings));
  }, [settings]);

  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  const deleteEvaluation = (id: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
    if (activeEvaluation?.id === id) {
      setActiveEvaluation(null);
    }
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

    // Generate random / heuristic metrics for the newly uploaded rehearsal
    const calculatedScore = Math.floor(Math.random() * 8) + 88; // 88 - 95
    const cadence = Math.floor(Math.random() * 16) + 130; // 130 - 145
    const fillerRate = Number((Math.random() * 0.8 + 0.4).toFixed(1)); // 0.4 - 1.2%

    const newEval: EvaluationData = {
      id: 'eval-' + Date.now(),
      presentationId: 'pres-' + Date.now(),
      title: payload.title || 'New Rehearsal Evaluation',
      date: 'Just now',
      formattedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: '5 min 14 sec',
      durationSeconds: 314,
      fileType: payload.fileType,
      fileSize: payload.fileSize || '24.5 MB',
      overallScore: calculatedScore,
      scoreTier: calculatedScore >= 90 ? 'Top 5% speaker tier' : 'Top 10% speaker tier',
      averageCadence: cadence,
      cadenceStatus: 'Optimal keynote pace (125-150)',
      fillerWordRate: fillerRate,
      fillerWordCount: Math.round(fillerRate * 5),
      fillerBreakdown: {
        um: 1,
        like: 2,
        uh: 0,
        youKnow: 1,
        actually: 0,
        so: 0
      },
      metrics: {
        delivery: Math.min(100, calculatedScore + 2),
        content: calculatedScore - 1,
        visuals: calculatedScore - 3,
        pacing: Math.min(100, calculatedScore + 4),
        clarity: calculatedScore,
        engagement: calculatedScore + 1
      },
      cadenceTimeline: [
        { time: '0:30', wpm: cadence - 6, targetMin: 125, targetMax: 150 },
        { time: '1:00', wpm: cadence - 2, targetMin: 125, targetMax: 150 },
        { time: '1:30', wpm: cadence + 4, targetMin: 125, targetMax: 150 },
        { time: '2:00', wpm: cadence + 2, targetMin: 125, targetMax: 150 },
        { time: '2:30', wpm: cadence - 1, targetMin: 125, targetMax: 150 },
        { time: '3:00', wpm: cadence + 5, targetMin: 125, targetMax: 150 },
        { time: '3:30', wpm: cadence, targetMin: 125, targetMax: 150 },
        { time: '4:00', wpm: cadence - 3, targetMin: 125, targetMax: 150 }
      ],
      strengths: [
        'Dynamic rhythm and excellent cadence control throughout key talking points.',
        'High vocal clarity and crisp enunciation on technical terminology.',
        'Extremely low filler word frequency, maintaining strong executive presence.'
      ],
      improvements: [
        'Introduce purposeful 2-second pauses before major takeaway transitions.',
        'Elevate pitch variation during the closing call to action to boost engagement.'
      ],
      transcript: [
        {
          id: 't-new-1',
          startTime: '00:00',
          seconds: 0,
          speaker: 'Speaker',
          text: `Thank you everyone for joining today's presentation on ${payload.title}.`,
          wpm: cadence - 5,
          tone: 'enthusiastic'
        },
        {
          id: 't-new-2',
          startTime: '00:25',
          seconds: 25,
          speaker: 'Speaker',
          text: 'We are addressing our core growth objectives and delivering key architectural milestones for the team.',
          wpm: cadence,
          tone: 'confident'
        },
        {
          id: 't-new-3',
          startTime: '00:58',
          seconds: 58,
          speaker: 'Speaker',
          text: 'Our AI evaluation benchmarks show an immediate improvement in delivery confidence and audience retention.',
          wpm: cadence + 3,
          tone: 'confident'
        }
      ],
      summary: `High-impact rehearsal for "${payload.title}". Delivery pacing was steady at ${cadence} WPM with minimal conversational fillers.`
    };

    setEvaluations(prev => [newEval, ...prev]);
    setActiveEvaluation(newEval);
    setIsProcessingModalOpen(false);
    return newEval;
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
      deleteEvaluation
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EvaluationData, ReportItem, UserSettings } from '../types';
import { initialEvaluations, initialReports, defaultSettings } from '../utils/mockData';
import { startAIAnalysisApi } from '../services/api';
import { generateDynamicEvaluation } from '../utils/dynamicEvaluation';
import { extractRealAudioMetrics, buildAccurateEvaluationData } from '../utils/audioAnalyzer';

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

    let newEval: EvaluationData;

    // Check if raw File object is provided for Web Audio API PCM analysis
    if (payload.fileObject) {
      setProcessingStatusText('Decoding Web Audio API PCM PCM frames & signal energy...');
      const realMetrics = await extractRealAudioMetrics(payload.fileObject);
      newEval = buildAccurateEvaluationData(
        payload.title,
        payload.fileType,
        payload.fileName,
        payload.fileSize,
        realMetrics
      );
    } else {
      newEval = generateDynamicEvaluation(payload);
    }

    // Attempt backend sync
    startAIAnalysisApi(payload);

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

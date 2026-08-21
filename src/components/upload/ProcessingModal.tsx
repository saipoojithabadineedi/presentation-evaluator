import React from 'react';
import { Sparkles, CheckCircle2, Loader2, Mic, Activity, Layers, FileCheck } from 'lucide-react';
import { useEvaluation } from '../../context/EvaluationContext';

export const ProcessingModal: React.FC = () => {
  const { isProcessingModalOpen, processingStep, processingStatusText } = useEvaluation();

  if (!isProcessingModalOpen) return null;

  const steps = [
    { id: 1, label: 'Audio Ingestion & Neural Transcription', icon: Mic },
    { id: 2, label: 'Cadence & Velocity Analysis (WPM)', icon: Activity },
    { id: 3, label: 'Filler Word & Pause Classification', icon: Sparkles },
    { id: 4, label: 'Visual Structure & Density Scoring', icon: Layers },
    { id: 5, label: 'Synthesizing Executive AI Report', icon: FileCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Dark blur backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity" />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-lg p-8 z-10 text-center space-y-6">
        
        {/* Animated Radar Glow & Spinner */}
        <div className="relative flex items-center justify-center py-4">
          <div className="absolute w-24 h-24 rounded-full bg-brand-500/15 animate-ping" />
          <div className="w-20 h-20 rounded-3xl bg-brand-500 text-white flex items-center justify-center shadow-xl shadow-brand-500/30 relative">
            <Sparkles className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Evaluation in Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 min-h-[20px]">
            {processingStatusText}
          </p>
        </div>

        {/* Multi-Step Progress Tracker */}
        <div className="space-y-3 text-left pt-2">
          {steps.map((step) => {
            const isDone = processingStep > step.id;
            const isCurrent = processingStep === step.id;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isCurrent 
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold'
                    : isDone
                    ? 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300'
                    : 'border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-600 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-xl ${
                    isCurrent || isDone ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm">{step.label}</span>
                </div>

                <div>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
                  {isCurrent && <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2">
          Processing with Presentation Evaluator AI engine...
        </div>

      </div>
    </div>
  );
};

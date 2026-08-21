import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Check, 
  Sparkles,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEvaluation } from '../../context/EvaluationContext';
import { ProfileSubNav } from './ProfileSubNav';
import { AppView, ReportItem } from '../../types';

interface ReportsArchiveViewProps {
  setCurrentView: (view: AppView) => void;
}

export const ReportsArchiveView: React.FC<ReportsArchiveViewProps> = ({ setCurrentView }) => {
  const { reports, evaluations, setActiveEvaluation, setActiveReport } = useEvaluation();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleOpenReport = (report: ReportItem) => {
    const matchingEval = evaluations.find(e => e.id === report.evaluationId) || evaluations[0];
    setActiveEvaluation(matchingEval);
    setActiveReport(report);
    setCurrentView('report');
  };

  const handleInstantDownload = (report: ReportItem) => {
    setDownloadingId(report.id);
    const matchingEval = evaluations.find(e => e.id === report.evaluationId) || evaluations[0];
    setActiveEvaluation(matchingEval);
    setActiveReport(report);

    setTimeout(() => {
      setDownloadingId(null);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
      // Navigate to report view to preview/download
      setCurrentView('report');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Shared Profile Sub-Navigation */}
      <ProfileSubNav currentView="reports-archive" setCurrentView={setCurrentView} />

      <div className="pt-2">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          PDF Reports Archive
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Dedicated repository for PDF evaluation reports of each speech and slide deck rehearsal
        </p>
      </div>

      {/* Reports Grid (Matches Sketch: "Pdf form of the report of each evaluation") */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-sm font-extrabold text-brand-600 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-xl border border-brand-100 dark:border-brand-900">
                  {rep.overallScore}%
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {rep.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {rep.executiveSummary}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">{rep.generatedDate}</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenReport(rep)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 shadow-2xs hover:border-brand-500 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => handleInstantDownload(rep)}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

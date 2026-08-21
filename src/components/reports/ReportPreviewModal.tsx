import React, { useRef, useState } from 'react';
import { 
  Download, 
  ArrowLeft, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Layers, 
  TrendingUp, 
  Mic, 
  Clock, 
  Share2,
  FileCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEvaluation } from '../../context/EvaluationContext';
import { AppView } from '../../types';

interface ReportPreviewProps {
  setCurrentView: (view: AppView) => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewProps> = ({ setCurrentView }) => {
  const { activeEvaluation, activeReport } = useEvaluation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!activeEvaluation) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">No report selected</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm shadow-sm"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${activeEvaluation.title.replace(/\s+/g, '_')}_Evaluation_Report.pdf`);

      setIsDownloaded(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      setTimeout(() => setIsDownloaded(false), 4000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Action Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => setCurrentView('evaluation')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Evaluation Results</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-colors text-xs font-semibold flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Document</span>
          </button>

          {/* Download PDF Button from Sketch */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all disabled:opacity-75"
          >
            {isDownloaded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* The Printable PDF Report Container (Matches Wireframe "Report in form Pdf") */}
      <div 
        ref={reportRef}
        className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-2xl p-8 sm:p-12 space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        
        {/* Header with Official Logo & Document Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b-2 border-slate-100 gap-6">
          <div>
            <img 
              src="/assets/logo.jpg" 
              alt="Presentation Evaluator" 
              className="h-14 w-auto object-contain mb-2"
            />
            <div className="text-[11px] font-bold tracking-wider text-teal-600 uppercase">
              Official Executive Speech Evaluation
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs text-slate-500">
            <div><strong className="text-slate-700">Document ID:</strong> {activeEvaluation.id.toUpperCase()}</div>
            <div><strong className="text-slate-700">Date Generated:</strong> {activeEvaluation.formattedDate}</div>
            <div><strong className="text-slate-700">Rehearsal Duration:</strong> {activeEvaluation.duration}</div>
          </div>
        </div>

        {/* Presentation Title Banner */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md">
              Evaluated Presentation
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeEvaluation.title}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeEvaluation.summary}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center min-w-[140px] shadow-2xs">
            <div className="text-3xl font-black text-brand-600">
              {activeEvaluation.overallScore}%
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-0.5">
              {activeEvaluation.scoreTier}
            </div>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">Average Cadence</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{activeEvaluation.averageCadence} WPM</div>
            <div className="text-[10px] text-brand-600 font-semibold mt-0.5">Optimal Keynote Range</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">Filler Word Rate</div>
            <div className="text-xl font-bold text-brand-600 mt-1">{activeEvaluation.fillerWordRate}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{activeEvaluation.fillerWordCount} total fillers</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">Delivery Mastery</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{activeEvaluation.metrics.delivery}%</div>
            <div className="text-[10px] text-brand-600 font-semibold mt-0.5">Vocal inflection</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">Content Clarity</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{activeEvaluation.metrics.clarity}%</div>
            <div className="text-[10px] text-brand-600 font-semibold mt-0.5">High comprehension</div>
          </div>

        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <h3>Validated Strengths</h3>
            </div>
            <div className="space-y-2">
              {activeEvaluation.strengths.map((str, i) => (
                <div key={i} className="p-3 rounded-xl bg-brand-50/40 border border-brand-100 text-xs text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <h3>Recommended Next Steps</h3>
            </div>
            <div className="space-y-2">
              {activeEvaluation.improvements.map((imp, i) => (
                <div key={i} className="p-3 rounded-xl bg-amber-50/40 border border-amber-100 text-xs text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Selected Transcript Segments */}
        {activeEvaluation.transcript.length > 0 && (
          <div className="pt-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Annotated Rehearsal Transcript Sample
            </h3>
            <div className="space-y-2">
              {activeEvaluation.transcript.slice(0, 3).map((seg) => (
                <div key={seg.id} className="p-3 rounded-xl border border-slate-100 text-xs flex items-start gap-3">
                  <span className="font-mono text-slate-400 font-semibold">{seg.startTime}</span>
                  <p className="text-slate-800 leading-relaxed">{seg.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Footer & Certification */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div>
            Evaluated by Presentation Evaluator Engine v2.4 • Certified Speech Analytics
          </div>
          <div>
            Page 1 of 1 • Confidential Rehearsal Report
          </div>
        </div>

      </div>

    </div>
  );
};

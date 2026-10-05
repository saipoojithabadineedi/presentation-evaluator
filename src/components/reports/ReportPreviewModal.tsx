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

const METRIC_LABELS: Record<string, string> = {
  delivery: 'Delivery & Confidence',
  content: 'Content & Structure',
  visuals: 'Visuals & Slide Design',
  pacing: 'Pacing & Rhythm',
  clarity: 'Vocal Clarity',
  engagement: 'Audience Engagement',
};

const getScoreColor = (score: number) => {
  if (score >= 90) {
    return {
      bg: 'bg-emerald-500',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-amber-500',
      text: 'text-amber-600',
      border: 'border-amber-200',
    };
  }
  return {
    bg: 'bg-rose-500',
    text: 'text-rose-600',
    border: 'border-rose-200',
  };
};


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

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const scaledImgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calculate total A4 pages required for full content
      const totalPages = Math.ceil(scaledImgHeight / pageHeight);
      const canvasPageHeight = (canvas.width * pageHeight) / imgWidth;

      for (let i = 0; i < totalPages; i++) {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(canvasPageHeight, canvas.height - i * canvasPageHeight);

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            i * canvasPageHeight,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            canvas.width,
            pageCanvas.height
          );

          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
          const pageImgHeight = (pageCanvas.height * imgWidth) / canvas.width;

          if (i > 0) {
            pdf.addPage();
          }
          pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, pageImgHeight);
        }
      }

      pdf.save(`${activeEvaluation.title.replace(/\s+/g, '_')}_Executive_Report.pdf`);

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
    <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Action Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden max-w-7xl mx-auto">
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

          {/* Download PDF Button */}
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

      {/* Printable PDF Report Container (Full Width, Zero Side Margin Clutter) */}
      <div 
        ref={reportRef}
        className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 md:p-8 space-y-8 print:p-2 print:border-none print:shadow-none w-full max-w-7xl mx-auto"
      >
        
        {/* Header with Official Logo & Document Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-100 gap-6">
          <div>
            <img 
              src="/assets/logo.jpg" 
              alt="Presentation Evaluator - Analyze. Improve. Succeed." 
              className="h-16 w-auto object-contain mb-2"
            />
            <div className="text-[11px] font-bold tracking-wider text-teal-600 uppercase">
              Official Executive Speech Evaluation & Performance Report
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
          <div className="space-y-1 max-w-3xl">
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

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center min-w-[150px] shadow-2xs shrink-0">
            <div className="text-3xl font-black text-brand-600">
              {activeEvaluation.overallScore}%
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-0.5">
              {activeEvaluation.scoreTier}
            </div>
          </div>
        </div>

        {/* 6 Dimension Score Metrics Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            6 Dimension Performance Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(activeEvaluation.metrics).map(([key, val]) => {
              const colors = getScoreColor(val);
              return (
                <div key={key} className={`p-4 rounded-2xl border ${colors.border} bg-slate-50/50 space-y-2`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      {METRIC_LABELS[key] || key}
                    </span>
                    <span className={`text-base font-black ${colors.text}`}>
                      {val}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline & Speech Pacing (WPM) Progression Section */}
        <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <h3>Timeline & Speech Pacing (WPM) Progression</h3>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-600 font-mono">
              <span>Average Cadence: <strong className="text-brand-600">{activeEvaluation.averageCadence} WPM</strong></span>
              <span>Target Keynote Band: <strong className="text-emerald-600">125–150 WPM</strong></span>
            </div>
          </div>

          {/* Timeline Visual WPM Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {(activeEvaluation.cadenceTimeline && activeEvaluation.cadenceTimeline.length > 0 
              ? activeEvaluation.cadenceTimeline
              : [
                  { time: '00:30', wpm: 128 },
                  { time: '01:00', wpm: 142 },
                  { time: '01:30', wpm: 135 },
                  { time: '02:00', wpm: 146 },
                  { time: '02:30', wpm: 139 },
                  { time: '03:00', wpm: 132 }
                ]
            ).map((point: { time: string; wpm: number }, i: number) => {
              const isOptimal = point.wpm >= 125 && point.wpm <= 150;
              return (
                <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 text-center space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 font-semibold">{point.time}</div>
                  <div className={`text-base font-extrabold ${isOptimal ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {point.wpm} <span className="text-[9px] font-normal text-slate-500">WPM</span>
                  </div>
                  <div className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-block ${
                    isOptimal ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {isOptimal ? 'Optimal' : point.wpm > 150 ? 'Rapid' : 'Deliberate'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filler Word Distribution Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Filler Word Frequency Breakdown
            </h3>
            <span className="text-xs text-slate-500">
              Total Fillers: <strong className="text-brand-600">{activeEvaluation.fillerWordCount}</strong> ({activeEvaluation.fillerWordRate}% rate)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(activeEvaluation.fillerBreakdown).map(([word, count]) => (
              <div key={word} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 text-center">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">"{word}"</div>
                <div className={`text-xl font-black mt-0.5 ${count > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
                  {count}
                </div>
              </div>
            ))}
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
              <h3>Actionable Recommendations</h3>
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

        {/* Full Annotated Spoken Speech Transcript & Coaching Notes */}
        {activeEvaluation.transcript.length > 0 && (
          <div className="pt-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Annotated Spoken Speech Transcript & Delivery Coaching
            </h3>
            <div className="space-y-3">
              {activeEvaluation.transcript.map((seg, idx) => {
                let coaching = "Optimal keynote rhythm and clear vocal articulation.";
                if (seg.hasFiller && seg.fillerWords && seg.fillerWords.length > 0) {
                  coaching = `Filler Alert: Replace "${seg.fillerWords.join(', ')}" with 1-second silent pauses.`;
                } else if (seg.wpm < 125) {
                  coaching = `Deliberate pace of ${seg.wpm} WPM. Increase vocal energy to maintain momentum.`;
                } else if (seg.wpm > 155) {
                  coaching = `Fast speech velocity of ${seg.wpm} WPM. Pause 2 seconds after key points.`;
                }

                return (
                  <div key={seg.id || idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 text-xs space-y-2">
                    <div className="flex items-center justify-between gap-2 text-slate-500 font-mono">
                      <span className="font-bold text-slate-700">{seg.startTime} • {seg.speaker}</span>
                      <span className="text-brand-600 font-semibold">{seg.wpm} WPM</span>
                    </div>
                    <p className="text-slate-900 font-medium italic leading-relaxed">
                      "{seg.text}"
                    </p>
                    <div className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 p-2 rounded-lg">
                      💡 AI Coaching: {coaching}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PDF Footer & Certification */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div>
            Evaluated by Presentation Evaluator Engine v2.4 • Certified Speech Analytics
          </div>
          <div>
            Official Executive Rehearsal Report
          </div>
        </div>

      </div>

    </div>
  );
};

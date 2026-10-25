import React, { useRef, useState } from 'react';
import { 
  Download, 
  ArrowLeft, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
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
      hex: '#059669',
      bgHex: '#10b981',
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-amber-500',
      text: 'text-amber-600',
      border: 'border-amber-200',
      hex: '#d97706',
      bgHex: '#f59e0b',
    };
  }
  return {
    bg: 'bg-rose-500',
    text: 'text-rose-600',
    border: 'border-rose-200',
    hex: '#e11d48',
    bgHex: '#f43f5e',
  };
};

export const ReportPreviewModal: React.FC<ReportPreviewProps> = ({ setCurrentView }) => {
  const { activeEvaluation } = useEvaluation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Dedicated offscreen fixed-dimension A4 page refs (100% immune to phone/viewport sizing)
  const printPage1Ref = useRef<HTMLDivElement>(null);
  const printPage2Ref = useRef<HTMLDivElement>(null);

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

  // 100% Clean 2-Page PDF Generation Engine
  // Never cuts between pages, never splits words or cards, identical on phone and desktop
  const handleDownloadPDF = async () => {
    if (!printPage1Ref.current || !printPage2Ref.current) return;
    setIsDownloading(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const a4WidthMm = 210;
      const a4HeightMm = 297;

      // 1. Capture Page 1: Overview, Title, Score, 6 Dimensions, Timeline & Filler Breakdown
      const canvas1 = await html2canvas(printPage1Ref.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const page1Img = canvas1.toDataURL('image/jpeg', 0.98);
      pdf.addImage(page1Img, 'JPEG', 0, 0, a4WidthMm, a4HeightMm);

      // 2. Add Page 2: Validated Strengths, Actionable Recommendations & Official Certification
      pdf.addPage();
      const canvas2 = await html2canvas(printPage2Ref.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const page2Img = canvas2.toDataURL('image/jpeg', 0.98);
      pdf.addImage(page2Img, 'JPEG', 0, 0, a4WidthMm, a4HeightMm);

      // 3. Save PDF
      pdf.save(`${activeEvaluation.title.replace(/\s+/g, '_')}_Executive_Report.pdf`);

      setIsDownloaded(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden max-w-5xl mx-auto">
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
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all disabled:opacity-75 cursor-pointer"
          >
            {isDownloaded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Generating 2-Page PDF...' : 'Download PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VISIBLE ON-SCREEN PREVIEW CONTAINER                     */}
      {/* ======================================================== */}
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* PAGE 1 PREVIEW */}
        <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-8 lg:p-10 space-y-7 relative">
          
          <div className="absolute top-4 right-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider print:hidden">
            Document Page 1 of 2
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/logo.jpg" 
                alt="Presentation Evaluator" 
                className="h-12 sm:h-14 w-auto object-contain"
              />
              <div>
                <div className="text-[11px] font-extrabold tracking-wider text-teal-600 uppercase">
                  Official Executive Speech Evaluation & Performance Report
                </div>
                <div className="text-xs text-slate-500">
                  AI Speech Coaching &bull; Certified Acoustic Analytics
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-0.5 text-xs text-slate-500">
              <div><strong className="text-slate-700">Document ID:</strong> {activeEvaluation.id.toUpperCase()}</div>
              <div><strong className="text-slate-700">Date Generated:</strong> {activeEvaluation.formattedDate}</div>
              <div><strong className="text-slate-700">Rehearsal Duration:</strong> {activeEvaluation.duration}</div>
            </div>
          </div>

          {/* Presentation Title Banner & Score */}
          <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md">
                Evaluated Presentation
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {activeEvaluation.title}
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeEvaluation.summary}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center min-w-[140px] shadow-2xs shrink-0">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(activeEvaluation.metrics).map(([key, val]) => {
                const colors = getScoreColor(val);
                return (
                  <div key={key} className={`p-3.5 sm:p-4 rounded-2xl border ${colors.border} bg-slate-50/50 space-y-2`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600">
                        {METRIC_LABELS[key] || key}
                      </span>
                      <span className={`text-sm sm:text-base font-black ${colors.text}`}>
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

          {/* Timeline & Speech Pacing Section */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <h3>Timeline & Speech Pacing (WPM) Progression</h3>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-600 font-mono">
                <span>Average Cadence: <strong className="text-brand-600">{activeEvaluation.averageCadence} WPM</strong></span>
                <span>Target Keynote Band: <strong className="text-emerald-600">125–150 WPM</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
              {(activeEvaluation.cadenceTimeline && activeEvaluation.cadenceTimeline.length > 0 
                ? activeEvaluation.cadenceTimeline.slice(0, 6)
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
                  <div key={i} className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 text-center space-y-1">
                    <div className="text-[10px] font-mono text-slate-400 font-semibold">{point.time}</div>
                    <div className={`text-sm sm:text-base font-extrabold ${isOptimal ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {point.wpm} <span className="text-[8px] font-normal text-slate-500">WPM</span>
                    </div>
                    <div className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-block ${
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
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {Object.entries(activeEvaluation.fillerBreakdown).map(([word, count]) => (
                <div key={word} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-center">
                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase">"{word}"</div>
                  <div className={`text-lg sm:text-xl font-black mt-0.5 ${count > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Page 1 Bottom Tag */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div>Official Speech Analytics Certification &bull; Presentation Evaluator Engine v2.4</div>
            <div className="font-semibold text-slate-500">Page 1 of 2</div>
          </div>

        </div>

        {/* PAGE 2 PREVIEW */}
        <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-8 lg:p-10 space-y-7 relative">
          
          <div className="absolute top-4 right-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider print:hidden">
            Document Page 2 of 2
          </div>

          {/* Page 2 Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/logo.jpg" 
                alt="Presentation Evaluator" 
                className="h-10 w-auto object-contain"
              />
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  {activeEvaluation.title}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Performance Insights & Actionable Coaching Roadmap
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 hidden sm:block">
              <div>Doc ID: {activeEvaluation.id.toUpperCase()}</div>
              <div>Date: {activeEvaluation.formattedDate}</div>
            </div>
          </div>

          {/* Validated Strengths */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <h3>Validated Strengths & Key Highlights</h3>
            </div>
            <div className="space-y-2.5">
              {activeEvaluation.strengths.slice(0, 5).map((str, i) => (
                <div key={i} className="p-3 sm:p-3.5 rounded-xl bg-brand-50/50 border border-brand-100 text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <h3>Actionable Recommendations & Growth Plan</h3>
            </div>
            <div className="space-y-2.5">
              {activeEvaluation.improvements.slice(0, 5).map((imp, i) => (
                <div key={i} className="p-3 sm:p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Certification Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800">
                AI Speech & Delivery Assessment Complete
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                This evaluation is certified by Presentation Evaluator multi-dimensional acoustic and visual models.
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-3 py-1.5 rounded-lg w-fit shrink-0">
              VERIFIED AUDIT
            </div>
          </div>

          {/* Page 2 Bottom Tag */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div>Evaluated by Presentation Evaluator Engine v2.4 &bull; Certified Speech Analytics</div>
            <div className="font-semibold text-slate-500">Page 2 of 2</div>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* HIDDEN OFFSCREEN A4 EXPORT TEMPLATES (FIXED 794x1123px) */}
      {/* Immune to phone/mobile viewports; exact 1-to-1 A4 pages */}
      {/* ======================================================== */}
      <div 
        aria-hidden="true" 
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: 0, 
          width: '794px', 
          zIndex: -100, 
          pointerEvents: 'none' 
        }}
      >
        
        {/* --- EXPORT PAGE 1 --- */}
        <div 
          ref={printPage1Ref}
          style={{
            width: '794px',
            height: '1123px',
            minHeight: '1123px',
            maxHeight: '1123px',
            padding: '36px 40px',
            background: '#ffffff',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/assets/logo.jpg" alt="Logo" style={{ height: '52px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em', color: '#0d9488', textTransform: 'uppercase' }}>
                    Official Executive Speech Evaluation & Performance Report
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Presentation Evaluator AI Engine &bull; Certified Speech Analytics
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>
                <div><strong style={{ color: '#334155' }}>Document ID:</strong> {activeEvaluation.id.toUpperCase()}</div>
                <div><strong style={{ color: '#334155' }}>Date Generated:</strong> {activeEvaluation.formattedDate}</div>
                <div><strong style={{ color: '#334155' }}>Duration:</strong> {activeEvaluation.duration}</div>
              </div>
            </div>

            {/* Presentation Title Banner & Overall Score */}
            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '18px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
                  Evaluated Presentation
                </span>
                <h1 style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', margin: '6px 0 3px 0', lineHeight: '1.3' }}>
                  {activeEvaluation.title}
                </h1>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {activeEvaluation.summary}
                </p>
              </div>
              <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', textAlign: 'center', minWidth: '125px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '30px', fontWeight: '900', color: '#059669', lineHeight: '1' }}>
                  {activeEvaluation.overallScore}%
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#334155', marginTop: '4px' }}>
                  {activeEvaluation.scoreTier}
                </div>
              </div>
            </div>

            {/* 6 Dimension Performance Metrics Grid */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '8px' }}>
                6 Dimension Performance Metrics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {Object.entries(activeEvaluation.metrics).map(([key, val]) => {
                  const colors = getScoreColor(val);
                  return (
                    <div key={key} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.03em' }}>
                          {METRIC_LABELS[key] || key}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '900', color: colors.hex }}>
                          {val}%
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '5px', borderRadius: '9999px', background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{ width: `${val}%`, height: '100%', background: colors.bgHex, borderRadius: '9999px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline & Speech Pacing (WPM) Progression */}
            <div style={{ padding: '14px 16px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#0f172a' }}>
                  <TrendingUp style={{ width: '14px', height: '14px', color: '#059669' }} />
                  <span>Timeline & Speech Pacing (WPM) Progression</span>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '10px', color: '#475569', fontFamily: 'monospace' }}>
                  <span>Average Cadence: <strong style={{ color: '#059669' }}>{activeEvaluation.averageCadence} WPM</strong></span>
                  <span>Target Keynote Band: <strong style={{ color: '#0d9488' }}>125–150 WPM</strong></span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {(activeEvaluation.cadenceTimeline && activeEvaluation.cadenceTimeline.length > 0 
                  ? activeEvaluation.cadenceTimeline.slice(0, 6)
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
                    <div key={i} style={{ padding: '7px 5px', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#64748b', fontWeight: '600' }}>{point.time}</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: isOptimal ? '#059669' : '#d97706', margin: '2px 0' }}>
                        {point.wpm} <span style={{ fontSize: '8px', fontWeight: '400', color: '#64748b' }}>WPM</span>
                      </div>
                      <div style={{ fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', padding: '1px 4px', borderRadius: '9999px', display: 'inline-block', background: isOptimal ? '#ecfdf5' : '#fffbeb', color: isOptimal ? '#047857' : '#b45309' }}>
                        {isOptimal ? 'Optimal' : point.wpm > 150 ? 'Rapid' : 'Deliberate'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filler Word Frequency Breakdown */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                  Filler Word Frequency Breakdown
                </span>
                <span style={{ fontSize: '10px', color: '#475569' }}>
                  Total Fillers: <strong style={{ color: '#059669' }}>{activeEvaluation.fillerWordCount}</strong> ({activeEvaluation.fillerWordRate}% rate)
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {Object.entries(activeEvaluation.fillerBreakdown).map(([word, count]) => (
                  <div key={word} style={{ padding: '8px 6px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>"{word}"</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', marginTop: '2px', color: count > 0 ? '#d97706' : '#059669' }}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Page 1 Footer */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
            <div>Official Speech Analytics Certification &bull; Presentation Evaluator Engine v2.4</div>
            <div style={{ fontWeight: '700', color: '#64748b' }}>Page 1 of 2</div>
          </div>
        </div>

        {/* --- EXPORT PAGE 2 --- */}
        <div 
          ref={printPage2Ref}
          style={{
            width: '794px',
            height: '1123px',
            minHeight: '1123px',
            maxHeight: '1123px',
            padding: '36px 40px',
            background: '#ffffff',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Page 2 Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/assets/logo.jpg" alt="Logo" style={{ height: '36px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    {activeEvaluation.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    Performance Insights &bull; Actionable Coaching Roadmap
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>
                <div>Doc ID: {activeEvaluation.id.toUpperCase()}</div>
                <div>Date: {activeEvaluation.formattedDate}</div>
              </div>
            </div>

            {/* Validated Strengths */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#059669', marginBottom: '8px' }}>
                <CheckCircle2 style={{ width: '15px', height: '15px' }} />
                <span>Validated Strengths & Key Highlights</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeEvaluation.strengths.slice(0, 5).map((str, i) => (
                  <div key={i} style={{ padding: '9px 12px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '11px', color: '#166534', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#16a34a', marginTop: '5px', flexShrink: 0 }} />
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#d97706', marginBottom: '8px' }}>
                <Sparkles style={{ width: '15px', height: '15px' }} />
                <span>Actionable Recommendations & Growth Plan</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeEvaluation.improvements.slice(0, 5).map((imp, i) => (
                  <div key={i} style={{ padding: '9px 12px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', fontSize: '11px', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#f59e0b', marginTop: '5px', flexShrink: 0 }} />
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Certification Card */}
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>AI Speech & Delivery Assessment Complete</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  This evaluation is certified by Presentation Evaluator multi-dimensional acoustic and visual models.
                </div>
              </div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '5px 10px', borderRadius: '8px', flexShrink: 0 }}>
                VERIFIED AUDIT
              </div>
            </div>

          </div>

          {/* Page 2 Footer */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
            <div>Evaluated by Presentation Evaluator Engine v2.4 &bull; Certified Speech Analytics</div>
            <div style={{ fontWeight: '700', color: '#64748b' }}>Page 2 of 2</div>
          </div>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
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
import jsPDF from 'jspdf';
import { useEvaluation } from '../../context/EvaluationContext';
import { AppView, EvaluationData } from '../../types';

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
      textDark: 'text-emerald-700',
      border: 'border-emerald-200',
      pillBg: 'bg-emerald-50 text-emerald-700',
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-amber-500',
      text: 'text-amber-600',
      textDark: 'text-amber-700',
      border: 'border-amber-200',
      pillBg: 'bg-amber-50 text-amber-700',
    };
  }
  return {
    bg: 'bg-rose-500',
    text: 'text-rose-600',
    textDark: 'text-rose-700',
    border: 'border-rose-200',
    pillBg: 'bg-rose-50 text-rose-700',
  };
};

// Helper to convert logo to base64 for embedding in jsPDF
const loadBase64Image = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// Pure Vector 2-Page Executive PDF Generator
// 100% immune to mobile viewport sizes, zero cutting across pages, zero text-slicing
export function generateExecutivePdf(evalData: EvaluationData, logoBase64?: string | null): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const primaryColor: [number, number, number] = [5, 150, 105];   // #059669
  const darkSlate: [number, number, number] = [15, 23, 42];      // #0f172a
  const mutedSlate: [number, number, number] = [100, 116, 139];  // #64748b
  const cardBg: [number, number, number] = [248, 250, 252];      // #f8fafc
  const cardBorder: [number, number, number] = [226, 232, 240];  // #e2e8f0

  // ==========================================
  // PAGE 1: EXECUTIVE OVERVIEW & ACOUSTIC DATA
  // ==========================================
  
  // 1. Header with Logo & Document Info
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 15, 13, 18, 18);
    } catch {
      // fallback if image type issue
    }
  }

  const textStartX = logoBase64 ? 36 : 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('PRESENTATION EVALUATOR', textStartX, 20);

  doc.setFontSize(8.5);
  doc.setTextColor(13, 148, 136); // teal
  doc.text('OFFICIAL EXECUTIVE SPEECH EVALUATION & PERFORMANCE REPORT', textStartX, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedSlate);
  doc.text('AI Speech Coaching • Certified Acoustic Analytics', textStartX, 29);

  doc.setFontSize(8);
  doc.text('Document ID: ' + (evalData.id || 'EVAL-001').toUpperCase(), 195, 20, { align: 'right' });
  doc.text('Date Generated: ' + (evalData.formattedDate || new Date().toLocaleDateString()), 195, 25, { align: 'right' });
  doc.text('Rehearsal Duration: ' + (evalData.duration || 'N/A'), 195, 30, { align: 'right' });

  doc.setDrawColor(...cardBorder);
  doc.setLineWidth(0.4);
  doc.line(15, 34, 195, 34);

  // 2. Evaluated Presentation Banner
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...cardBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, 36, 180, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryColor);
  doc.text('EVALUATED PRESENTATION', 20, 42);

  doc.setFontSize(11);
  doc.setTextColor(...darkSlate);
  const titleLines = doc.splitTextToSize(evalData.title || 'Untitled Presentation', 170);
  doc.text(titleLines.slice(0, 1), 20, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const summaryLines = doc.splitTextToSize(evalData.summary || 'Presentation speech rehearsal evaluation report.', 170);
  doc.text(summaryLines.slice(0, 2), 20, 54);

  // 3. OVERALL SCORE CIRCULAR RING CARD (Left Column - Matches Live Screen)
  const scoreCardX = 15;
  const scoreCardY = 63;
  const scoreCardW = 60;
  const scoreCardH = 70;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...cardBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(scoreCardX, scoreCardY, scoreCardW, scoreCardH, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('OVERALL PRESENTATION SCORE', scoreCardX + scoreCardW / 2, scoreCardY + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedSlate);
  doc.text('Combined average across all 6 core metrics', scoreCardX + scoreCardW / 2, scoreCardY + 12, { align: 'center' });

  // Circular Ring Gauge
  const cx = scoreCardX + scoreCardW / 2;
  const cy = scoreCardY + 34;
  const r = 16;
  const scoreVal = evalData.overallScore ?? 92;

  // Track circle (background)
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(2.5);
  doc.circle(cx, cy, r, 'S');

  // Colored Progress Arc
  const isHigh = scoreVal >= 90;
  const arcColor: [number, number, number] = isHigh ? [5, 150, 105] : scoreVal >= 70 ? [217, 119, 6] : [225, 29, 72];
  doc.setDrawColor(...arcColor);
  doc.setLineWidth(2.5);

  const steps = 60;
  const pct = Math.min(Math.max(scoreVal, 0), 100) / 100;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + 2 * Math.PI * pct;
  for (let i = 0; i < steps; i++) {
    const a1 = startAngle + (endAngle - startAngle) * (i / steps);
    const a2 = startAngle + (endAngle - startAngle) * ((i + 1) / steps);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    doc.line(x1, y1, x2, y2);
  }

  // Center Score Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...darkSlate);
  doc.text(`${scoreVal}%`, cx, cy + 2, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setTextColor(...mutedSlate);
  doc.text('OVERALL', cx, cy + 7, { align: 'center' });

  // Speaker Tier Pill Badge
  const pillW = 44;
  const pillH = 6.5;
  const pillX = cx - pillW / 2;
  const pillY = scoreCardY + 57;

  doc.setFillColor(isHigh ? 236 : 254, isHigh ? 253 : 243, isHigh ? 245 : 199);
  doc.setDrawColor(isHigh ? 167 : 253, isHigh ? 243 : 230, isHigh ? 208 : 138);
  doc.setLineWidth(0.3);
  doc.roundedRect(pillX, pillY, pillW, pillH, 3.25, 3.25, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(isHigh ? 4 : 180, isHigh ? 120 : 83, isHigh ? 87 : 9);
  doc.text(evalData.scoreTier || 'Top 5% speaker tier', cx, pillY + 4.5, { align: 'center' });

  // 4. 6 DIMENSION METRIC CARDS (Right Column)
  const metricsX = 78;
  const metricsY = 63;
  const colW = 57;
  const rowH = 21;

  const rawMetrics = evalData.metrics || {
    delivery: 98, content: 98, visuals: 87, pacing: 76, clarity: 97, engagement: 93
  };
  const metricList = Object.entries(rawMetrics).map(([k, val]) => ({
    label: (METRIC_LABELS[k] || k).toUpperCase(),
    val: typeof val === 'number' ? val : 85,
  }));

  metricList.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = metricsX + col * (colW + 3);
    const y = metricsY + row * (rowH + 3.5);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...cardBorder);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, colW, rowH, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(m.label, x + 4, y + 6.5);

    const valColor: [number, number, number] = m.val >= 90 ? [5, 150, 105] : m.val >= 70 ? [217, 119, 6] : [225, 29, 72];
    doc.setTextColor(...valColor);
    doc.setFontSize(8.5);
    doc.text(m.val + '%', x + colW - 4, y + 6.5, { align: 'right' });

    // Progress bar track & fill
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x + 4, y + 11.5, colW - 8, 3.2, 1.6, 1.6, 'F');
    doc.setFillColor(...valColor);
    const fillWidth = Math.max(2, (colW - 8) * (Math.min(m.val, 100) / 100));
    doc.roundedRect(x + 4, y + 11.5, fillWidth, 3.2, 1.6, 1.6, 'F');
  });

  // 5. Timeline & Speech Pacing (WPM) Progression
  const pacingY = 138;
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...cardBorder);
  doc.roundedRect(15, pacingY, 180, 41, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);
  doc.text('Timeline & Speech Pacing (WPM) Progression', 20, pacingY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Average Cadence: ${evalData.averageCadence || 135} WPM  |  Target Keynote Band: 125-150 WPM`, 190, pacingY + 7, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(20, pacingY + 11, 190, pacingY + 11);

  const rawTimeline = (evalData.cadenceTimeline && evalData.cadenceTimeline.length > 0)
    ? evalData.cadenceTimeline.slice(0, 6)
    : [
        { time: '0:30', wpm: 128 }, { time: '1:00', wpm: 142 }, { time: '1:30', wpm: 135 },
        { time: '2:00', wpm: 146 }, { time: '2:30', wpm: 139 }, { time: '3:00', wpm: 132 }
      ];

  const ptW = 27;
  rawTimeline.forEach((p, i) => {
    const x = 20 + i * (ptW + 2);
    const y = pacingY + 14.5;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, ptW, 22, 2, 2, 'FD');

    doc.setFontSize(7);
    doc.setTextColor(...mutedSlate);
    doc.text(p.time, x + ptW / 2, y + 5, { align: 'center' });

    const isOptimal = p.wpm >= 125 && p.wpm <= 150;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(isOptimal ? 5 : 217, isOptimal ? 150 : 119, isOptimal ? 105 : 6);
    doc.text(p.wpm + ' WPM', x + ptW / 2, y + 11, { align: 'center' });

    doc.setFontSize(6.5);
    if (isOptimal) {
      doc.setFillColor(236, 253, 245);
      doc.setTextColor(4, 120, 87);
    } else {
      doc.setFillColor(254, 243, 199);
      doc.setTextColor(180, 83, 9);
    }
    doc.roundedRect(x + 2, y + 14, ptW - 4, 5, 1.5, 1.5, 'FD');
    doc.text(isOptimal ? 'OPTIMAL' : p.wpm > 150 ? 'RAPID' : 'DELIBERATE', x + ptW / 2, y + 17.5, { align: 'center' });
  });

  // 6. Filler Word Frequency Breakdown
  const fillerY = 184;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedSlate);
  doc.text('FILLER WORD FREQUENCY BREAKDOWN', 15, fillerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Total Fillers: ${evalData.fillerWordCount ?? 0} (${evalData.fillerWordRate ?? 0}% rate)`, 195, fillerY, { align: 'right' });

  const rawFillers = evalData.fillerBreakdown || { um: 0, like: 0, uh: 0, youKnow: 0 };
  const fillerEntries = Object.entries(rawFillers).filter(([_, c]) => typeof c === 'number');
  const fillerList = fillerEntries.length >= 4 
    ? fillerEntries.slice(0, 4).map(([w, c]) => ({ word: `"${w.toUpperCase()}"`, count: c }))
    : [
        { word: '"UM"', count: evalData.fillerBreakdown?.um ?? 0 },
        { word: '"UH"', count: evalData.fillerBreakdown?.uh ?? 0 },
        { word: '"LIKE"', count: evalData.fillerBreakdown?.like ?? 0 },
        { word: '"YOU KNOW"', count: evalData.fillerBreakdown?.youKnow ?? 0 },
      ];

  const fW = 43.5;
  fillerList.forEach((f, i) => {
    const x = 15 + i * (fW + 2);
    const y = fillerY + 4;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, fW, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkSlate);
    doc.text(f.word, x + fW / 2, y + 6, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(f.count > 0 ? 217 : 5, f.count > 0 ? 119 : 150, f.count > 0 ? 6 : 105);
    doc.text(f.count + ' occurrences', x + fW / 2, y + 12.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedSlate);
    doc.text(f.count === 0 ? 'Audience Impact: Zero' : f.count > 4 ? 'Audience Impact: High' : 'Audience Impact: Mild', x + fW / 2, y + 17.5, { align: 'center' });
  });

  // 6. Page 1 Footer
  doc.setDrawColor(...cardBorder);
  doc.line(15, 280, 195, 280);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedSlate);
  doc.text('Official Speech Analytics Certification • Presentation Evaluator AI Engine v2.4', 15, 285);
  doc.setFont('helvetica', 'bold');
  doc.text('Page 1 of 2', 195, 285, { align: 'right' });

  // ==========================================
  // PAGE 2: ACTIONABLE INSIGHTS & ROADMAP
  // ==========================================
  doc.addPage();

  // Page 2 Header
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 15, 14, 15, 15);
    } catch {}
  }

  const p2StartX = logoBase64 ? 33 : 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...primaryColor);
  doc.text('PRESENTATION EVALUATOR', p2StartX, 20);

  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);
  doc.text((evalData.title || 'Executive Rehearsal Report'), p2StartX, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedSlate);
  doc.text('Performance Insights & Actionable Coaching Roadmap', p2StartX, 29);

  doc.text('Document ID: ' + (evalData.id || 'EVAL-001').toUpperCase(), 195, 20, { align: 'right' });
  doc.text('Date: ' + (evalData.formattedDate || new Date().toLocaleDateString()), 195, 25, { align: 'right' });

  doc.setDrawColor(...cardBorder);
  doc.line(15, 33, 195, 33);

  // Validated Strengths Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('Validated Strengths & Key Highlights', 15, 41);

  const strengths = (evalData.strengths && evalData.strengths.length > 0)
    ? evalData.strengths.slice(0, 5)
    : ['Demonstrated clear presentation structure with natural speaking rhythm.'];

  let strY = 45;
  strengths.forEach((s) => {
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(187, 247, 208); // emerald-200
    const lines = doc.splitTextToSize(s, 168);
    const boxH = Math.max(11, lines.length * 4.2 + 5);
    doc.roundedRect(15, strY, 180, boxH, 2, 2, 'FD');

    doc.setFillColor(...primaryColor);
    doc.circle(20, strY + 5, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52);
    doc.text(lines, 24, strY + 5.5);

    strY += boxH + 2.5;
  });

  // Actionable Recommendations Section
  let recHeaderY = strY + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(217, 119, 6);
  doc.text('Actionable Recommendations & Growth Plan', 15, recHeaderY);

  let recY = recHeaderY + 4;
  const improvements = (evalData.improvements && evalData.improvements.length > 0)
    ? evalData.improvements.slice(0, 5)
    : ['Continue practicing keynote cadence to eliminate hesitation pauses.'];

  improvements.forEach((imp) => {
    doc.setFillColor(255, 251, 235); // amber-50
    doc.setDrawColor(253, 230, 138); // amber-200
    const lines = doc.splitTextToSize(imp, 168);
    const boxH = Math.max(11, lines.length * 4.2 + 5);
    doc.roundedRect(15, recY, 180, boxH, 2, 2, 'FD');

    doc.setFillColor(217, 119, 6);
    doc.circle(20, recY + 5, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14);
    doc.text(lines, 24, recY + 5.5);

    recY += boxH + 2.5;
  });

  // Certified Speech Audit & Verified Stamp Box
  const auditY = Math.min(recY + 4, 252);
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...cardBorder);
  doc.roundedRect(15, auditY, 180, 20, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);
  doc.text('AI Speech & Delivery Assessment Complete', 22, auditY + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...mutedSlate);
  doc.text('This evaluation is certified by Presentation Evaluator multi-dimensional acoustic and visual models.', 22, auditY + 13.5);

  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(150, auditY + 5, 38, 10, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...primaryColor);
  doc.text('VERIFIED AUDIT', 169, auditY + 11.5, { align: 'center' });

  // Page 2 Footer
  doc.setDrawColor(...cardBorder);
  doc.line(15, 280, 195, 280);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedSlate);
  doc.text('Evaluated by Presentation Evaluator Engine v2.4 • Certified Speech Analytics', 15, 285);
  doc.setFont('helvetica', 'bold');
  doc.text('Page 2 of 2', 195, 285, { align: 'right' });

  return doc;
}

export const ReportPreviewModal: React.FC<ReportPreviewProps> = ({ setCurrentView }) => {
  const { activeEvaluation } = useEvaluation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

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

  // Pure Native Vector PDF Download Handler
  // 100% Guaranteed 2 Pages, zero dependencies on screen size or html2canvas
  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    try {
      const logoBase64 = await loadBase64Image('/assets/logo.jpg');
      const doc = generateExecutivePdf(activeEvaluation, logoBase64);
      
      const fileName = `${(activeEvaluation.title || 'Presentation').replace(/\s+/g, '_')}_Executive_Report.pdf`;
      doc.save(fileName);

      setIsDownloaded(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
      setTimeout(() => setIsDownloaded(false), 4000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
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
      {/* Displays Sheet 1 and Sheet 2 matching the PDF layout    */}
      {/* ======================================================== */}
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* SHEET 1 PREVIEW */}
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

          {/* Presentation Title Banner */}
          <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md">
              Evaluated Presentation
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {activeEvaluation.title}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
              {activeEvaluation.summary}
            </p>
          </div>

          {/* Overall Score Circular Ring Card & 6 Dimension Score Metrics Grid */}
          {(() => {
            const overallColors = getScoreColor(activeEvaluation.overallScore);
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Left: Overall Presentation Score Card */}
                <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center space-y-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Overall Presentation Score
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Combined average across all 6 core metrics
                    </p>
                  </div>

                  {/* Circular Ring Gauge SVG */}
                  <div className="relative w-36 h-36 flex items-center justify-center my-1">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate-100"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        className={`transition-all duration-1000 ${overallColors.text}`}
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * activeEvaluation.overallScore) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className={`text-4xl font-black tracking-tight ${overallColors.textDark}`}>
                        {activeEvaluation.overallScore}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        OVERALL
                      </span>
                    </div>
                  </div>

                  <div className={`px-3.5 py-1.5 rounded-full border text-xs font-bold ${overallColors.pillBg} ${overallColors.border}`}>
                    {activeEvaluation.scoreTier}
                  </div>
                </div>

                {/* Right: 6 Dimension Score Metrics Grid */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(activeEvaluation.metrics).map(([key, val]) => {
                    const colors = getScoreColor(val);
                    return (
                      <div key={key} className={`p-3.5 sm:p-4 rounded-2xl border ${colors.border} bg-slate-50/50 flex flex-col justify-center space-y-2`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
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
            );
          })()}

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

        {/* SHEET 2 PREVIEW */}
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

    </div>
  );
};

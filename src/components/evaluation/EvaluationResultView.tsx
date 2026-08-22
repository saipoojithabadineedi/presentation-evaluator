import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Mic, 
  CheckCircle2, 
  FileText, 
  ArrowLeft, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  Clock, 
  Layers, 
  AlertCircle, 
  ChevronRight,
  Share2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { useEvaluation } from '../../context/EvaluationContext';
import { AppView } from '../../types';

interface EvaluationResultViewProps {
  setCurrentView: (view: AppView) => void;
}

export const EvaluationResultView: React.FC<EvaluationResultViewProps> = ({ setCurrentView }) => {
  const { activeEvaluation, generateReport, openUploadModal } = useEvaluation();
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'cadence' | 'slides'>('overview');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);

  if (!activeEvaluation) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">No evaluation selected</h2>
        <button
          onClick={openUploadModal}
          className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm shadow-sm"
        >
          Upload Presentation
        </button>
      </div>
    );
  }

  const handleMakeReport = () => {
    generateReport(activeEvaluation);
    setCurrentView('report');
  };

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Evaluation link copied to clipboard!')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-500 transition-colors text-xs font-semibold flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Core Action from Wireframe: "Make a Report" */}
          <button
            onClick={handleMakeReport}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Make a Report</span>
          </button>
        </div>
      </div>

      {/* Header Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold">
              {activeEvaluation.fileType.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">
              {activeEvaluation.formattedDate} • {activeEvaluation.duration}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {activeEvaluation.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {activeEvaluation.summary}
          </p>
        </div>

        {/* Big Overall Score Badge */}
        <div className="flex items-center gap-6 p-4 sm:p-6 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50">
          <div>
            <div className="text-4xl sm:text-5xl font-black text-brand-600 dark:text-brand-400 tracking-tight">
              {activeEvaluation.overallScore}%
            </div>
            <div className="text-xs font-bold text-brand-700 dark:text-brand-300 mt-0.5">
              {activeEvaluation.scoreTier}
            </div>
          </div>
          <div className="h-12 w-px bg-brand-200 dark:bg-brand-800" />
          <div className="space-y-1 text-xs">
            <div className="text-slate-500 dark:text-slate-400">Average Cadence</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">{activeEvaluation.averageCadence} WPM</div>
            <div className="text-slate-500 dark:text-slate-400">Filler Rate</div>
            <div className="font-bold text-brand-600 dark:text-brand-400">{activeEvaluation.fillerWordRate}%</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Delivery & Content Metrics
        </button>

        <button
          onClick={() => setActiveTab('cadence')}
          className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'cadence'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Pacing & WPM Timeline
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'transcript'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Annotated Transcript ({activeEvaluation.transcript.length} segments)
        </button>

        {activeEvaluation.slides && activeEvaluation.slides.length > 0 && (
          <button
            onClick={() => setActiveTab('slides')}
            className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'slides'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Slide Visual Breakdown ({activeEvaluation.slides.length} slides)
          </button>
        )}
      </div>

      {/* Tab 1: Delivery & Content Metrics Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Live Audio & Speech Pitch Waveform Spectrum (WOW Visual Feature) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAudio}
                  className="p-3 rounded-2xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center"
                >
                  {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Live AI Speech Pitch & Frequency Visualizer</span>
                    <span className="px-2 py-0.5 rounded-full bg-brand-950 text-brand-400 border border-brand-800/80 text-[10px] font-mono">
                      REALTIME SPECTRUM
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isPlayingAudio ? 'Playing rehearsed audio stream...' : 'Click play to simulate pitch modulation audio playback'}
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>Cadence: <strong className="text-brand-400">{activeEvaluation.averageCadence} WPM</strong></span>
                <span>Pacing Score: <strong className="text-emerald-400">{activeEvaluation.metrics.pacing}%</strong></span>
              </div>
            </div>

            {/* Dynamic Animated Frequency Spectrum Bars */}
            <div className="h-16 flex items-end justify-between gap-1 pt-2">
              {Array.from({ length: 48 }).map((_, i) => {
                const heightPercent = isPlayingAudio 
                  ? Math.floor(20 + Math.sin(i * 0.5) * 35 + Math.random() * 45)
                  : Math.floor(15 + (i % 5) * 12);
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-150 ${
                      isPlayingAudio ? 'bg-gradient-to-t from-teal-500 to-brand-400' : 'bg-slate-700/60'
                    }`}
                    style={{ 
                      height: `${heightPercent}%`,
                      transitionDelay: `${(i % 6) * 20}ms`
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* 6 Dimension Score Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Object.entries(activeEvaluation.metrics).map(([key, val]) => (
              <div 
                key={key}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {key}
                  </span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    {val}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      val >= 90 ? 'bg-brand-500' : val >= 80 ? 'bg-teal-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Recommendations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-brand-600 dark:text-brand-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <h3>Key Strengths Detected</h3>
              </div>
              <ul className="space-y-3">
                {activeEvaluation.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-amber-500 font-bold text-base">
                <AlertCircle className="w-5 h-5" />
                <h3>Actionable Areas for Improvement</h3>
              </div>
              <ul className="space-y-3">
                {activeEvaluation.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Filler Word Distribution Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Filler Word Frequency Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total detected fillers: <span className="font-bold text-brand-600">{activeEvaluation.fillerWordCount}</span> across {activeEvaluation.duration}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(activeEvaluation.fillerBreakdown).map(([word, count]) => (
                <div 
                  key={word}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center"
                >
                  <div className="text-xs font-semibold uppercase text-slate-400">
                    "{word}"
                  </div>
                  <div className={`text-2xl font-black mt-1 ${count > 0 ? 'text-amber-500' : 'text-brand-500'}`}>
                    {count}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {count === 0 ? 'Flawless' : `${count} occurrence`}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Pacing & WPM Timeline */}
      {activeTab === 'cadence' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cadence Progression (Words Per Minute)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target keynote band highlighted in green (125–150 WPM)
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-brand-500" />
                  <span className="text-slate-600 dark:text-slate-300">Speaker Pace</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-brand-100 dark:bg-brand-900/60" />
                  <span className="text-slate-600 dark:text-slate-300">Optimal Zone</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeEvaluation.cadenceTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[100, 180]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: '#0f172a', 
                      border: 'none', 
                      color: '#fff',
                      fontSize: '12px' 
                    }} 
                    formatter={(val: number) => [`${val} WPM`, 'Pace']}
                  />
                  <ReferenceArea y1={125} y2={150} fill="#10b981" fillOpacity={0.12} />
                  <ReferenceLine y={135} stroke="#10b981" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="wpm" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10b981', r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Annotated Transcript */}
      {activeTab === 'transcript' && (
        <div className="space-y-6">
          
          {/* Simulated Audio Player Bar */}
          <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAudio}
                className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Audio Rehearsal Stream
                </div>
                <div className="text-[11px] text-slate-500">
                  {isPlayingAudio ? 'Playing at 1.0x • 00:42 / ' + activeEvaluation.duration : 'Click play to listen to synchronized delivery'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-brand-600" />
              <div className="w-24 h-1.5 rounded-full bg-brand-200 dark:bg-brand-800 overflow-hidden">
                <div className="h-full bg-brand-500 w-3/4" />
              </div>
            </div>
          </div>

          {/* Transcript List */}
          <div className="space-y-3">
            {activeEvaluation.transcript.map((seg, idx) => (
              <div
                key={seg.id}
                onClick={() => setActiveSegmentIndex(idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeSegmentIndex === idx
                    ? 'bg-white dark:bg-slate-900 border-brand-500 shadow-md shadow-brand-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300">
                      {seg.startTime}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{seg.speaker}</span>
                    <span className="text-slate-400">• {seg.wpm} WPM</span>
                  </div>
                  {seg.hasFiller && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                      Filler Detected: "{seg.fillerWords?.join(', ')}"
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {seg.text}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Tab 4: Slide Breakdown */}
      {activeTab === 'slides' && activeEvaluation.slides && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeEvaluation.slides.map((slide) => (
            <div 
              key={slide.slideNumber}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg">
                  Slide {slide.slideNumber}
                </span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  {slide.score}%
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {slide.title}
                </h4>
                <div className="text-xs text-slate-400">
                  Bullets: {slide.bulletsCount} • Visual Balance: {slide.visualBalanceScore}%
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {slide.suggestions[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA from Wireframe: "make a report" */}
      <div className="p-6 sm:p-8 rounded-3xl bg-brand-500 text-white shadow-xl shadow-brand-500/25 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-extrabold">
            Ready to export this evaluation?
          </h3>
          <p className="text-xs sm:text-sm text-brand-100 mt-1">
            Generate an executive-ready branded PDF report with delivery benchmarks and transcript highlights.
          </p>
        </div>
        <button
          onClick={handleMakeReport}
          className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-brand-600 font-extrabold text-sm shadow-lg transition-all flex items-center gap-2 shrink-0"
        >
          <FileText className="w-4 h-4 text-brand-600" />
          <span>Make a Report</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

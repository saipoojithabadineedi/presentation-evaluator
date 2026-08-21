import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  TrendingUp, 
  Mic, 
  CheckCircle2, 
  Presentation, 
  FileText, 
  FileVideo, 
  FileAudio,
  Check, 
  ArrowRight,
  StopCircle,
  Play,
  User as UserIcon,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvaluation } from '../../context/EvaluationContext';
import { AppView, EvaluationData } from '../../types';

interface DashboardProps {
  setCurrentView: (view: AppView) => void;
  onOpenSidebar: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentView, onOpenSidebar }) => {
  const { user } = useAuth();
  const { evaluations, startAIAnalysis, setActiveEvaluation } = useEvaluation();

  // In-page upload state
  const [activeUploadTab, setActiveUploadTab] = useState<'upload' | 'record' | 'samples'>('upload');
  const [presentationTitle, setPresentationTitle] = useState('Q3 Product Strategy Pitch');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: 'video' | 'audio' | 'slides' } | null>({
    name: 'product_strategy_q3_rehearsal.mp4',
    size: '48.2 MB',
    type: 'video'
  });

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const type: 'video' | 'audio' | 'slides' = file.type.includes('video') 
        ? 'video' 
        : file.type.includes('pdf') || file.name.endsWith('.pptx') 
        ? 'slides' 
        : 'audio';
      
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setSelectedFile({ name: file.name, size: sizeMb, type });
      setPresentationTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSampleClick = (sampleTitle: string, type: 'video' | 'audio' | 'slides', size: string) => {
    setSelectedFile({ name: `${sampleTitle}.${type === 'video' ? 'mp4' : type === 'audio' ? 'wav' : 'pdf'}`, size, type });
    setPresentationTitle(sampleTitle);
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      setSelectedFile({
        name: `Live_Rehearsal_${new Date().toISOString().slice(0, 10)}.wav`,
        size: `${(recordSeconds * 0.1).toFixed(1)} MB`,
        type: 'audio'
      });
      setPresentationTitle(`Live Speech Rehearsal (${recordSeconds}s)`);
    } else {
      setRecordSeconds(0);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAIAnalyzeClick = async () => {
    const finalTitle = presentationTitle.trim() || 'New Presentation Rehearsal';
    const finalFileType = selectedFile?.type || 'video';
    const finalFileSize = selectedFile?.size || '48.2 MB';
    const finalFileName = selectedFile?.name || 'presentation_file.mp4';

    await startAIAnalysis({
      title: finalTitle,
      fileType: finalFileType,
      fileName: finalFileName,
      fileSize: finalFileSize
    });

    // Directly transitions to "Result of the uploaded file"
    setCurrentView('evaluation');
  };

  const handleViewExistingReport = (item: EvaluationData) => {
    setActiveEvaluation(item);
    setCurrentView('evaluation');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Home Page Top Banner with Profile Access */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>AI Speech & Slide Evaluation Engine Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name || 'John Doe'}!
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Upload your presentation audio, video, or slide deck below for instantaneous AI speech delivery, pacing, and visual analysis.
          </p>
        </div>

        {/* Top Right Profile Button from Sketch */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all shadow-xs"
          >
            <img 
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"} 
              alt="Profile" 
              className="w-7 h-7 rounded-xl object-cover ring-2 ring-brand-500/30"
            />
            <span>Profile Menu</span>
          </button>
        </div>
      </div>

      {/* CORE WORKFLOW SECTION: UPLOAD PRESENTATION & AI ANALYZE BUTTON (From Sketch) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-brand-500/30 dark:border-brand-500/30 shadow-xl shadow-brand-500/5 p-6 sm:p-10 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-md">
              Home Page Upload Hub
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Upload Your Presentation
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveUploadTab('upload')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeUploadTab === 'upload' 
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload File</span>
            </button>

            <button
              onClick={() => setActiveUploadTab('record')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeUploadTab === 'record' 
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Live Mic</span>
            </button>

            <button
              onClick={() => setActiveUploadTab('samples')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeUploadTab === 'samples' 
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Sample Presets</span>
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Presentation Rehearsal Title
          </label>
          <input 
            type="text"
            value={presentationTitle}
            onChange={(e) => setPresentationTitle(e.target.value)}
            placeholder="e.g. Q3 Product Strategy Pitch"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Upload Mode 1: File Dropzone */}
        {activeUploadTab === 'upload' && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-brand-500/40 hover:border-brand-500 rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all bg-brand-50/20 dark:bg-brand-950/20 hover:bg-brand-50/40 flex flex-col items-center justify-center group"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".mp4,.mov,.wav,.mp3,.pdf,.pptx"
              className="hidden" 
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-brand-500/30 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {selectedFile ? selectedFile.name : 'Click to browse or drop your presentation file here'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Selected: <span className="font-semibold text-brand-600">{selectedFile ? `${selectedFile.type.toUpperCase()} • ${selectedFile.size}` : 'None'}</span> — Supports .mp4, .wav, .mp3, .pdf, .pptx
            </p>
          </div>
        )}

        {/* Upload Mode 2: Live Mic Recording */}
        {activeUploadTab === 'record' && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <button
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                  isRecording 
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40' 
                    : 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/40'
                }`}
              >
                {isRecording ? <StopCircle className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
              </button>
            </div>
            <div className="text-3xl font-mono font-black text-slate-900 dark:text-white mb-1">
              {formatTimer(recordSeconds)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRecording ? '🔴 Live Recording in progress... speak clearly into your mic' : 'Click the mic icon to start your presentation rehearsal'}
            </p>
          </div>
        )}

        {/* Upload Mode 3: Preset Samples */}
        {activeUploadTab === 'samples' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: 'Q3 Product Strategy Pitch', type: 'video' as const, size: '48.2 MB' },
              { title: 'AI Pitch Deck Keynote', type: 'audio' as const, size: '35.6 MB' },
              { title: 'Series A Investor Deck', type: 'slides' as const, size: '12.4 MB' }
            ].map((s, idx) => (
              <div
                key={idx}
                onClick={() => handleSampleClick(s.title, s.type, s.size)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedFile?.name.includes(s.title)
                    ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/50 text-brand-600">
                    {s.type === 'video' ? <FileVideo className="w-4 h-4" /> : s.type === 'audio' ? <FileAudio className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  {selectedFile?.name.includes(s.title) && (
                    <Check className="w-4 h-4 text-brand-500" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {s.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {s.type.toUpperCase()} • {s.size}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CORE CTA: "AI Analyze" BUTTON (Directly as drawn in sketch) */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Selected Presentation: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFile?.name || 'Ready to analyze'}</span>
          </div>

          <button
            onClick={handleAIAnalyzeClick}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-brand-500/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>AI Analyze</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Overall Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900/60 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400 tracking-tight">
              92%
            </div>
            <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">
              ↑ Top 5% speaker tier
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Average Cadence
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center">
              <Mic className="w-4 h-4 text-sky-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              135 <span className="text-sm font-semibold text-slate-400">WPM</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Optimal keynote pace (125–150)
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Filler Word Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400 tracking-tight">
              0.8%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Zero "um" / "like" detected
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Rehearsals Evaluated
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center">
              <Presentation className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              14
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Total 5.4 practice hours
            </div>
          </div>
        </div>

      </div>

      {/* Recent Evaluations Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Speech Evaluations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Detailed AI-generated reports with transcript and delivery breakdowns
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="pb-3.5 pl-2">Presentation Title</th>
                <th className="pb-3.5 px-4">Date</th>
                <th className="pb-3.5 px-4">Pace</th>
                <th className="pb-3.5 px-4">Score</th>
                <th className="pb-3.5 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs sm:text-sm">
              {evaluations.map((item) => (
                <tr 
                  key={item.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => handleViewExistingReport(item)}
                >
                  <td className="py-4 pl-2 font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span>{item.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                    {item.averageCadence} WPM
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      {item.overallScore}%
                    </span>
                  </td>
                  <td className="py-4 pr-2 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewExistingReport(item);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

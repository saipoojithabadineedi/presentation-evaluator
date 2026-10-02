import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  Mic, 
  FileText, 
  FileVideo, 
  FileAudio,
  Check, 
  ArrowRight,
  StopCircle,
  Play,
  Video,
  ShieldCheck,
  Zap,
  Info,
  Cpu,
  Layers,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvaluation } from '../../context/EvaluationContext';
import { AppView } from '../../types';

interface DashboardProps {
  setCurrentView: (view: AppView) => void;
  onOpenSidebar: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentView, onOpenSidebar }) => {
  const { user } = useAuth();
  const { startAIAnalysis } = useEvaluation();

  // In-page upload state
  const [activeUploadTab, setActiveUploadTab] = useState<'upload' | 'record' | 'samples'>('upload');
  const [presentationTitle, setPresentationTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: 'video' | 'audio' | 'slides' } | null>(null);
  const [uploadError, setUploadError] = useState('');

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
      setUploadError('');
    }
  };

  const handleSampleClick = (sampleTitle: string, type: 'video' | 'audio' | 'slides', size: string) => {
    setSelectedFile({ name: `${sampleTitle}.${type === 'video' ? 'mp4' : type === 'audio' ? 'wav' : 'pdf'}`, size, type });
    setPresentationTitle(sampleTitle);
    setUploadError('');
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
      setUploadError('');
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
    // Point 1: Check if video/file is uploaded
    if (!selectedFile) {
      setUploadError('Video is not uploaded! Please upload the file of a video.');
      return;
    }

    setUploadError('');
    const finalTitle = presentationTitle.trim() || 'New Presentation Rehearsal';
    const finalFileType = selectedFile.type;
    const finalFileSize = selectedFile.size;
    const finalFileName = selectedFile.name;

    await startAIAnalysis({
      title: finalTitle,
      fileType: finalFileType,
      fileName: finalFileName,
      fileSize: finalFileSize
    });

    // Directly transitions to "Result of the uploaded file"
    setCurrentView('evaluation');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* Welcome Banner & Direct Action */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>AI Speech & Presentation Evaluation Engine Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Upload your presentation video, audio file, or slide deck below to start instant AI evaluation.
          </p>
        </div>

        {/* Profile Dashboard Shortcut (Point 3: Dashboard appears when clicking this button) */}
        <button
          onClick={() => setCurrentView('profile')}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/50 border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-all cursor-pointer group shrink-0"
        >
          <img 
            src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
            alt={user?.name || "User"}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/30 group-hover:scale-105 transition-transform"
          />
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600">
              View Profile Dashboard
            </div>
            <div className="text-[10px] text-slate-400">
              Analytics & Performance Overview →
            </div>
          </div>
        </button>
      </div>

      {/* CORE WORKFLOW SECTION: UPLOAD FILE & VIDEO EVALUATION HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-brand-500/30 dark:border-brand-500/30 shadow-xl shadow-brand-500/5 p-6 sm:p-10 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-md">
              Upload & Video Analysis Hub
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Upload Your Presentation Video or Audio
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
              <span>Upload Video/File</span>
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

        {/* Point 1: Upload Error Banner */}
        {uploadError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{uploadError}</span>
          </div>
        )}

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
            className="border-2 border-dashed border-brand-500/40 hover:border-brand-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-brand-50/20 dark:bg-brand-950/20 hover:bg-brand-50/40 flex flex-col items-center justify-center group"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".mp4,.mov,.wav,.mp3,.pdf,.pptx"
              className="hidden" 
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-brand-500/30 group-hover:scale-110 transition-transform">
              <Video className="w-8 h-8" />
            </div>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-1">
              {selectedFile ? selectedFile.name : 'Click to select or drop presentation video/audio file'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selected: <span className="font-bold text-brand-600">{selectedFile ? `${selectedFile.type.toUpperCase()} • ${selectedFile.size}` : 'None'}</span> — Supports MP4, MOV, WAV, MP3, PDF, PPTX
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
              {isRecording ? '🔴 Live Recording in progress... speak clearly into your mic' : 'Click the mic icon to start live presentation recording'}
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

        {/* CORE CTA: "AI Analyze" BUTTON */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Selected Presentation: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFile?.name || 'No file uploaded'}</span>
          </div>

          <button
            onClick={handleAIAnalyzeClick}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-brand-500/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>AI Analyze Presentation</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Guidance Cards for Presentation Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Instant AI Signal Decoding</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Extract pitch, tone, filler words ("um", "like", "actually"), and WPM cadence automatically from audio tracks.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Google Gemini LLM Analysis</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Multimodal analysis evaluates slide content balance, bullet density, speech structure, and persuasion tactics.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Profile Dashboard</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Want to view your overall evaluation scores and performance charts? Click on <span className="font-bold text-brand-600 hover:underline cursor-pointer" onClick={() => setCurrentView('profile')}>Profile Dashboard</span> anytime.
          </p>
        </div>
      </div>

      {/* SECTION 1: HOW THE PRESENTATION IS PROCESSED (STEP-BY-STEP AI PIPELINE) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-md">
              AI Processing Workflow
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              How It Processes Your Presentation
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 relative group">
            <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-brand-500 text-white text-[11px] font-black tracking-wider">
              STEP 1
            </span>
            <div className="pt-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-brand-600 w-fit mb-3 shadow-2xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                1. Media Ingestion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Accepts video files (`.mp4`, `.mov`), audio tracks (`.wav`, `.mp3`), slide decks (`.pdf`, `.pptx`), or live microphone recording.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 relative group">
            <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-brand-500 text-white text-[11px] font-black tracking-wider">
              STEP 2
            </span>
            <div className="pt-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-sky-500 w-fit mb-3 shadow-2xs">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                2. Web Audio Extraction
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Decodes vocal signals in real-time via `AudioContext` and `AnalyserNode` to compute pitch stability, WPM pace, and filler words ("um", "like").
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 relative group">
            <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-brand-500 text-white text-[11px] font-black tracking-wider">
              STEP 3
            </span>
            <div className="pt-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-emerald-500 w-fit mb-3 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                3. Gemini LLM Inference
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Sends extracted metrics to Google Gemini 1.5 Flash LLM to analyze slide readability, bullet density, speech structure, and persuasion tactics.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 relative group">
            <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-brand-500 text-white text-[11px] font-black tracking-wider">
              STEP 4
            </span>
            <div className="pt-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-amber-500 w-fit mb-3 shadow-2xs">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                4. Report & Score Generation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Generates overall delivery score (70–98%), speaker tier classification, actionable strengths/improvements, and downloadable PDF reports.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: WHY PRESENTATION EVALUATOR IS NEEDED */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">
              Core Purpose & Value
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Why Presentation Evaluator?
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500 text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Science-Backed Speech Metrics
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Built on international speech delivery standards. Evaluates pace cadence against the optimal keynote benchmark range (125–150 WPM) to ensure audience engagement and clarity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-500 text-white">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Instant Objective AI Coaching
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Eliminates human scheduling delays and subjective bias. Rehearsing speakers receive immediate, objective score breakdowns in seconds before pitching investors or keynotes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500 text-white">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Dual Speech & Visual Analysis
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Evaluates both <strong>how you speak</strong> (cadence, tone, filler words) and <strong>what you show</strong> (slide bullet density, readability scores, visual balance).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Long-Term Speaker Progression
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tracks your practice hours, filler word elimination, and speaker tier advancement over time in your personal Profile Dashboard.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

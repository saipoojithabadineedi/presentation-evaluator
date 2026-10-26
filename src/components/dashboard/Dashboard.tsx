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
  AlertTriangle,
  Users,
  GraduationCap,
  Briefcase,
  Presentation,
  Activity,
  Volume2,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvaluation } from '../../context/EvaluationContext';
import { AppView, TranscriptSegment } from '../../types';

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
  const [selectedFile, setSelectedFile] = useState<{ 
    name: string; 
    size: string; 
    type: 'video' | 'audio' | 'slides'; 
    durationSec?: number; 
    rawFile?: File 
  } | null>(null);
  const [uploadError, setUploadError] = useState('');

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [liveTranscriptText, setLiveTranscriptText] = useState('');
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const liveTranscriptSegmentsRef = useRef<TranscriptSegment[]>([]);
  const recognitionRef = useRef<any>(null);
  const recordSecondsRef = useRef(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Reject PDF and PPTX — only video and audio are supported
      const isVideo = file.type.includes('video') || ['.mp4', '.mov', '.webm'].some(ext => file.name.toLowerCase().endsWith(ext));
      const isAudio = file.type.includes('audio') || ['.mp3', '.wav', '.m4a', '.ogg'].some(ext => file.name.toLowerCase().endsWith(ext));

      if (!isVideo && !isAudio) {
        setUploadError('Only video (MP4, MOV, WEBM) and audio (MP3, WAV, M4A) files are supported. PDFs and slide files are not accepted.');
        e.target.value = '';
        return;
      }

      const type: 'video' | 'audio' = isVideo ? 'video' : 'audio';
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setSelectedFile({ name: file.name, size: sizeMb, type, rawFile: file });
      setPresentationTitle(file.name.replace(/\.[^/.]+$/, ""));
      setUploadError('');

      // Extract duration if video or audio
      if (file.type.includes('video') || file.type.includes('audio')) {
        const mediaElem = document.createElement(file.type.includes('video') ? 'video' : 'audio');
        mediaElem.preload = 'metadata';
        mediaElem.src = URL.createObjectURL(file);
        mediaElem.onloadedmetadata = () => {
          const duration = Math.round(mediaElem.duration || 0);
          if (duration > 0) {
            setSelectedFile(prev => prev ? { ...prev, durationSec: duration } : null);
          }
        };
      }
    }
  };

  const handleSampleClick = (sampleTitle: string, type: 'video' | 'audio' | 'slides', size: string) => {
    setSelectedFile({ name: `${sampleTitle}.${type === 'video' ? 'mp4' : type === 'audio' ? 'wav' : 'pdf'}`, size, type });
    setPresentationTitle(sampleTitle);
    setUploadError('');
  };

  // Helper to cleanly stop recording, flush audio chunks, and produce a valid audio File
  const stopRecordingAsync = (): Promise<{ rawFile: File; durationSec: number } | null> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }

      const duration = recordSecondsRef.current > 0 ? recordSecondsRef.current : 10;

      const finishAndCreateFile = () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const rawFile = new File([audioBlob], `Live_Speech_${Date.now()}.webm`, { type: 'audio/webm' });
          if (liveTranscriptSegmentsRef.current.length > 0) {
            (rawFile as any)._liveTranscript = [...liveTranscriptSegmentsRef.current];
          }
          resolve({ rawFile, durationSec: duration });
        } catch (e) {
          console.warn('Error creating audio file from chunks:', e);
          resolve(null);
        }
      };

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        if (audioChunksRef.current.length > 0) {
          finishAndCreateFile();
        } else {
          resolve(null);
        }
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        finishAndCreateFile();
      };

      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      } catch (err) {
        console.warn('Error stopping media recorder:', err);
        finishAndCreateFile();
      }
    });
  };

  const toggleRecording = async () => {
    if (isRecording) {
      const recorded = await stopRecordingAsync();
      if (recorded && recorded.rawFile) {
        setSelectedFile({
          name: recorded.rawFile.name,
          size: `${(recorded.rawFile.size / (1024 * 1024)).toFixed(1)} MB`,
          type: 'audio',
          durationSec: recorded.durationSec,
          rawFile: recorded.rawFile
        });
        setPresentationTitle(`Live Speech Rehearsal (${recorded.durationSec}s)`);
        setUploadError('');
      }
    } else {
      setRecordSeconds(0);
      recordSecondsRef.current = 0;
      setIsRecording(true);
      audioChunksRef.current = [];
      liveTranscriptSegmentsRef.current = [];
      setLiveTranscriptText('');
      setUploadError('');

      // Web Speech Recognition for real-time speech-to-text
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          let lastFinalIdx = 0;
          recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              const transcriptPart = event.results[i][0].transcript;
              fullText += transcriptPart + ' ';

              if (event.results[i].isFinal && i >= lastFinalIdx) {
                lastFinalIdx = i + 1;
                const currentSec = Math.max(1, recordSecondsRef.current);
                const startSec = Math.max(0, currentSec - 5);
                const mins = Math.floor(startSec / 60);
                const secs = (startSec % 60).toString().padStart(2, '0');
                const endMins = Math.floor(currentSec / 60);
                const endSecs = (currentSec % 60).toString().padStart(2, '0');

                const textTrimmed = transcriptPart.trim();
                const lower = textTrimmed.toLowerCase();
                const fillerMatches = lower.match(/\b(um|uh|like|actually|you know|so)\b/gi) || [];

                liveTranscriptSegmentsRef.current.push({
                  id: `live-seg-${liveTranscriptSegmentsRef.current.length + 1}`,
                  startTime: `${mins}:${secs}`,
                  endTime: `${endMins}:${endSecs}`,
                  seconds: startSec,
                  speaker: 'Presenter',
                  text: textTrimmed,
                  hasFiller: fillerMatches.length > 0,
                  fillerWords: fillerMatches.length > 0 ? Array.from(new Set(fillerMatches.map((f: string) => f.toLowerCase()))) : undefined,
                  wpm: Math.max(75, Math.min(180, Math.round(textTrimmed.split(/\s+/).length / (Math.max(1, currentSec - startSec) / 60)))),
                  tone: 'confident'
                });
              }
            }
            setLiveTranscriptText(fullText.trim());
          };

          recognition.onerror = (e: any) => {
            console.warn('SpeechRecognition error:', e);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('Could not start Speech Recognition:', e);
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(250); // timeslice every 250ms
        mediaRecorderRef.current = mediaRecorder;
      } catch (err: any) {
        console.warn('Microphone permission not granted or unavailable:', err);
        setIsRecording(false);
        setUploadError('Microphone access denied. Please allow microphone permissions in your browser to record.');
        return;
      }

      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => {
          const next = prev + 1;
          recordSecondsRef.current = next;
          return next;
        });
      }, 1000);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAIAnalyzeClick = async () => {
    let fileToAnalyze = selectedFile;

    // If user is actively recording in Live Mic mode, automatically stop the recorder,
    // package the recorded voice audio into a File, and immediately analyze it!
    if (isRecording) {
      const recorded = await stopRecordingAsync();
      if (recorded && recorded.rawFile) {
        const sizeMb = (recorded.rawFile.size / (1024 * 1024)).toFixed(1) + ' MB';
        const fileObj = {
          name: recorded.rawFile.name,
          size: sizeMb,
          type: 'audio' as const,
          durationSec: recorded.durationSec,
          rawFile: recorded.rawFile
        };
        setSelectedFile(fileObj);
        fileToAnalyze = fileObj;
        if (!presentationTitle.trim()) {
          setPresentationTitle(`Live Speech Rehearsal (${recorded.durationSec}s)`);
        }
      }
    }

    // Verify presentation media is present
    if (!fileToAnalyze) {
      if (activeUploadTab === 'record') {
        setUploadError('Please click the microphone button to start recording your speech before analyzing.');
      } else if (activeUploadTab === 'samples') {
        setUploadError('Please select a sample preset before analyzing.');
      } else {
        setUploadError('Please upload a presentation video or audio file to analyze.');
      }
      return;
    }

    setUploadError('');
    const finalTitle = presentationTitle.trim() || (activeUploadTab === 'record' ? `Live Speech Rehearsal (${fileToAnalyze.durationSec || 15}s)` : 'New Presentation Rehearsal');
    const finalFileType = fileToAnalyze.type;
    const finalFileSize = fileToAnalyze.size;
    const finalFileName = fileToAnalyze.name;
    const finalDurationSec = fileToAnalyze.durationSec || 15;
    const rawFile = fileToAnalyze.rawFile;

    await startAIAnalysis({
      title: finalTitle,
      fileType: finalFileType,
      fileName: finalFileName,
      fileSize: finalFileSize,
      durationSeconds: finalDurationSec,
      fileObject: rawFile
    });

    // Directly transitions to "Result of the uploaded file"
    setCurrentView('evaluation');
  };

  return (
    <div id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
      
      {/* UNIFIED HERO & UPLOAD SECTION (Combined Banner + Upload & Video Analysis Hub) */}
      <div id="upload-hub" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-5 sm:p-10 lg:p-12 space-y-8 scroll-mt-24 relative overflow-hidden w-full max-w-full">
        
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Part: Title, Description & Ultra-Professional AI Analytics Visual HUD */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100 dark:border-slate-800/80">
          
          {/* Left Text Block */}
          <div className="space-y-4 max-w-xl text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-black tracking-wide">
              <Sparkles className="w-4 h-4 text-brand-500 fill-brand-500 animate-pulse" />
              <span>AI Powered Engine Active</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Analyze Your Presentation Performance
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Get detailed AI-powered feedback on your presentation skills, delivery, and communication style. Select your video or audio file below to start instant evaluation.
            </p>
          </div>

          {/* Right Visual: Clean, Professional AI Presentation Analytics Hero Image */}
          <div className="relative w-full lg:w-[480px] h-[280px] sm:h-[320px] shrink-0 flex items-center justify-center z-10">
            <div className="w-full h-full relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-2xl bg-white dark:bg-slate-900 group transition-all hover:scale-[1.02]">
              <img 
                src="/assets/presentation_hero_analytics.jpg" 
                alt="AI Presentation Analytics - Speaker Review Session" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Bottom Part: Integrated Upload Controls & Interactive Dropzone */}
        <div className="space-y-6 pt-2">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-md">
                Upload & Video Analysis Hub
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Upload Your Presentation Video or Audio
              </h2>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveUploadTab('upload')}
                className={`px-3 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  activeUploadTab === 'upload' 
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <UploadCloud className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Upload Video/File</span>
                <span className="inline sm:hidden">Upload</span>
              </button>

              <button
                onClick={() => setActiveUploadTab('record')}
                className={`px-3 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  activeUploadTab === 'record' 
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Mic className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Live Mic</span>
                <span className="inline sm:hidden">Mic</span>
              </button>

              <button
                onClick={() => setActiveUploadTab('samples')}
                className={`px-3 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  activeUploadTab === 'samples' 
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Play className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Sample Presets</span>
                <span className="inline sm:hidden">Samples</span>
              </button>
            </div>
          </div>

          {/* Upload Error Banner */}
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
                accept=".mp4,.mov,.webm,.mp3,.wav,.m4a,.ogg"
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
                Selected: <span className="font-bold text-brand-600">{selectedFile ? `${selectedFile.type.toUpperCase()} • ${selectedFile.size}` : 'None'}</span> — Supports MP4, MOV, WEBM, MP3, WAV, M4A
              </p>
            </div>
          )}

          {/* Upload Mode 2: Live Mic Recording */}
          {activeUploadTab === 'record' && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-10 text-center bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                    isRecording 
                      ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 ring-4 ring-rose-500/20' 
                      : 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/40 hover:scale-105'
                  }`}
                  title={isRecording ? 'Click to stop recording' : 'Click to start recording'}
                >
                  {isRecording ? <StopCircle className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
                </button>
              </div>

              <div className="text-3xl font-mono font-black text-slate-900 dark:text-white">
                {formatTimer(recordSeconds)}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 max-w-md">
                {isRecording 
                  ? '🔴 Live recording in progress... speak clearly into your mic (click "Analyze" below or stop when done)' 
                  : selectedFile?.type === 'audio' && selectedFile.rawFile
                    ? `✓ Voice recording captured (${selectedFile.durationSec || recordSeconds}s)! Click "Analyze Presentation" below to evaluate your speech.`
                    : 'Click the mic icon to start live presentation recording'}
              </p>

              {/* Real-time Spoken Text Preview while recording */}
              {isRecording && liveTranscriptText && (
                <div className="max-w-md w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-left text-xs text-slate-700 dark:text-slate-200 shadow-xs animate-in fade-in">
                  <div className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                    <span>Live Voice Speech Recognized:</span>
                  </div>
                  <p className="italic text-slate-600 dark:text-slate-300 leading-relaxed">
                    "{liveTranscriptText}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Upload Mode 3: Preset Samples */}
          {activeUploadTab === 'samples' && (
            <div className="space-y-4">
              {/* Explanatory Info Card */}
              <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/80 flex items-start gap-3 text-xs">
                <Sparkles className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-extrabold text-brand-900 dark:text-brand-200">
                    Instant Demo Mode — No Upload Required
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Select any pre-configured sample presentation below to test our AI speech decoding, WPM pacing analysis, and slide evaluation engine instantly.
                  </div>
                </div>
              </div>

              {/* Sample Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { 
                    title: 'Q3 Product Strategy Pitch', 
                    type: 'video' as const, 
                    size: '48.2 MB',
                    desc: 'Full video pitch with audio track & slide deck visuals'
                  },
                  { 
                    title: 'AI Pitch Deck Keynote', 
                    type: 'audio' as const, 
                    size: '35.6 MB',
                    desc: 'High-fidelity audio recording for WPM pacing & filler word detection'
                  },
                  { 
                    title: 'Series A Investor Deck', 
                    type: 'slides' as const, 
                    size: '12.4 MB',
                    desc: 'PDF slide deck for AI visual layout & bullet density analysis'
                  }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSampleClick(s.title, s.type, s.size)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      selectedFile?.name.includes(s.title)
                        ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/50 text-brand-600">
                          {s.type === 'video' ? <FileVideo className="w-4 h-4" /> : s.type === 'audio' ? <FileAudio className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        {selectedFile?.name.includes(s.title) && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {s.title}
                      </div>
                      <div className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                        {s.type.toUpperCase()} • {s.size}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CORE CTA: "AI Analyze Presentation" BUTTON */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Selected Presentation:{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {isRecording
                  ? `🔴 Recording Live Speech (${formatTimer(recordSeconds)})`
                  : selectedFile?.name || (activeUploadTab === 'record' ? 'No voice recorded yet' : 'No file uploaded')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAIAnalyzeClick}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-brand-500/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span>{isRecording ? 'Finish & Analyze Voice' : 'Analyze Presentation'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>

      {/* SECTION: FEATURES */}
      <div id="features" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-5 sm:p-8 space-y-6 scroll-mt-24 w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-md">
              Core Capabilities
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Platform Features
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-brand-300 dark:hover:border-brand-700 transition-all">
            <div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-brand-600 w-fit mb-3 shadow-2xs">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                Real-Time Speech Cadence & Tone
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Measures words-per-minute (WPM), speech rhythm, pauses, and pitch stability to ensure dynamic, engaging vocal delivery.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-amber-300 dark:hover:border-amber-700 transition-all">
            <div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-amber-500 w-fit mb-3 shadow-2xs">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                Filler Word & Hesitation Detection
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pinpoints filler words like "um", "uh", "like", and "actually" with exact counts and timestamped alerts to sharpen verbal clarity.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
            <div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-purple-500 w-fit mb-3 shadow-2xs">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                Slide & Visual Synchronization
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Evaluates slide density, bullet point structure, visual balance, and alignment between what you say and what you show.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
            <div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-emerald-500 w-fit mb-3 shadow-2xs">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                360° Multi-Metric Scoring
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Granular scoring across Clarity, Engagement, Content Structure, and Delivery with percentile ranking against industry benchmarks.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-sky-300 dark:hover:border-sky-700 transition-all">
            <div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-sky-500 w-fit mb-3 shadow-2xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                Progress & Speaker Tier Growth
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Track historical improvements across multiple presentations and advance through speaker tiers with personalized milestones.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-rose-300 dark:hover:border-rose-700 transition-all">
            <div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-rose-500 w-fit mb-3 shadow-2xs">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                Executive PDF Reports & Actionable Coaching
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Generate exportable PDF audit summaries and receive concrete, step-by-step coaching tips powered by Gemini AI.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: HOW THE PRESENTATION IS PROCESSED (STEP-BY-STEP AI PIPELINE) */}
      <div id="how-it-works" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-5 sm:p-8 space-y-6 scroll-mt-24 w-full max-w-full overflow-hidden">
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
      <div id="why-presentation-evaluator" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-5 sm:p-8 space-y-6 scroll-mt-24 w-full max-w-full overflow-hidden">
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

      {/* SECTION 3: WHO CAN USE IT */}
      <div id="who-can-use-it" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-5 sm:p-8 space-y-6 scroll-mt-24 w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md">
              Target Audience & Users
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Who Can Use Presentation Evaluator?
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3 hover:border-brand-500/50 transition-all">
            <div className="p-2.5 rounded-xl bg-indigo-500 text-white w-fit">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Students & Researchers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Perfect for rehearsing thesis defenses, capstone presentations, conference papers, and seminar talks to eliminate filler words and maintain clear pacing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3 hover:border-brand-500/50 transition-all">
            <div className="p-2.5 rounded-xl bg-brand-500 text-white w-fit">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Executives & Founders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Designed for high-stakes investor pitch decks, board presentations, company keynotes, and all-hands town halls requiring high energy and clear persuasion.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3 hover:border-brand-500/50 transition-all">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white w-fit">
              <Presentation className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Sales & Marketing Teams
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fine-tune product demos, client sales proposals, and marketing webinars to deliver impactful, persuasive pitches that convert prospects.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3 hover:border-brand-500/50 transition-all">
            <div className="p-2.5 rounded-xl bg-sky-500 text-white w-fit">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Educators & Public Speakers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Analyze lecture timing, slide density, and voice modulation to maintain maximum student and audience engagement during workshops and lectures.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3 hover:border-brand-500/50 transition-all sm:col-span-2 lg:col-span-2">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white w-fit">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Job Candidates & Interview Preparation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Prepare for technical interview presentations, case study walk-throughs, and behavioral interview responses with real-time feedback on confidence, speech speed, and clarity.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

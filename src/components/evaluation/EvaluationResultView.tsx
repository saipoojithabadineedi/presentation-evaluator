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
  Volume1,
  VolumeX,
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
import { useEvaluation, mediaBlobRegistry, mediaBlobUrlRegistry } from '../../context/EvaluationContext';
import { getMediaFileFromDB } from '../../utils/mediaStore';
import { AppView } from '../../types';

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
      text: 'text-emerald-500',
      textDark: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/80',
      pillBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-amber-500',
      text: 'text-amber-500',
      textDark: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/80',
      pillBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
    };
  }
  return {
    bg: 'bg-rose-500',
    text: 'text-rose-500',
    textDark: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800/80',
    pillBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
  };
};

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

  const mediaElementRef = React.useRef<HTMLMediaElement | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animFrameRef = React.useRef<number | null>(null);
  const [liveSpectrum, setLiveSpectrum] = useState<number[]>(new Array(48).fill(15));

  // Pre-load audio blob from IndexedDB on component mount / eval change
  React.useEffect(() => {
    let isMounted = true;
    if (activeEvaluation?.id) {
      if (!mediaBlobUrlRegistry.has(activeEvaluation.id) && !mediaBlobRegistry.has(activeEvaluation.id)) {
        getMediaFileFromDB(activeEvaluation.id).then(file => {
          if (file && isMounted) {
            mediaBlobRegistry.set(activeEvaluation.id, file);
            const url = URL.createObjectURL(file);
            mediaBlobUrlRegistry.set(activeEvaluation.id, url);
          }
        });
      }
    }
    return () => {
      isMounted = false;
      stopAllAudio();
    };
  }, [activeEvaluation?.id]);

  const [audioVolume, setAudioVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = (newVol: number) => {
    setAudioVolume(newVol);
    if (newVol === 0) {
      setIsMuted(true);
      if (mediaElementRef.current) {
        mediaElementRef.current.muted = true;
      }
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsMuted(false);
      if (mediaElementRef.current) {
        mediaElementRef.current.muted = false;
        mediaElementRef.current.volume = newVol;
      }
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (mediaElementRef.current) {
      mediaElementRef.current.muted = nextMuted;
      if (!nextMuted) {
        mediaElementRef.current.volume = audioVolume > 0 ? audioVolume : 0.85;
        if (audioVolume === 0) setAudioVolume(0.85);
      }
    }
    if (nextMuted && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  const fallbackSpeechSynthesis = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    const speechText = activeEvaluation.transcript.map(t => t.text).join(' ');
    if (!speechText) return;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.volume = isMuted ? 0 : audioVolume;
    utterance.rate = 1.0;
    utterance.onend = () => stopAllAudio();
    utterance.onerror = () => stopAllAudio();

    setIsPlayingAudio(true);
    startSpectrumAnimation();
    window.speechSynthesis.speak(utterance);
  };

  const stopAllAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaElementRef.current) {
      try {
        mediaElementRef.current.onerror = null;
        mediaElementRef.current.onended = null;
        mediaElementRef.current.pause();
        mediaElementRef.current.src = '';
        if (mediaElementRef.current.parentNode) {
          mediaElementRef.current.parentNode.removeChild(mediaElementRef.current);
        }
      } catch (e) {
        console.warn('Error cleaning up media element:', e);
      }
      mediaElementRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setIsPlayingAudio(false);
    setLiveSpectrum(new Array(48).fill(15));
  };

  const startSpectrumAnimation = () => {
    const update = () => {
      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const newBars: number[] = [];
        for (let i = 0; i < 48; i++) {
          const binIndex = Math.floor((i / 48) * bufferLength);
          const val = dataArray[binIndex] || 0;
          const height = Math.max(15, Math.min(95, Math.floor((val / 255) * 85 + 15)));
          newBars.push(height);
        }
        setLiveSpectrum(newBars);
      } else {
        const newBars = Array.from({ length: 48 }).map((_, i) =>
          Math.floor(20 + Math.sin(Date.now() * 0.008 + i * 0.4) * 35 + Math.random() * 25)
        );
        setLiveSpectrum(newBars);
      }
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);
  };

  const handleMakeReport = () => {
    generateReport(activeEvaluation);
    setCurrentView('report');
  };

  const toggleAudio = () => {
    // 1. If currently playing -> PAUSE cleanly without resetting playback position
    if (isPlayingAudio) {
      stopAllAudio();
      return;
    }

    // 2. If currently paused with an active media element -> RESUME from current timestamp
    if (!isPlayingAudio && mediaElementRef.current && mediaElementRef.current.src) {
      mediaElementRef.current.volume = isMuted ? 0 : audioVolume;
      mediaElementRef.current.muted = isMuted;
      const playPromise = mediaElementRef.current.play();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      playPromise
        .then(() => {
          setIsPlayingAudio(true);
          startSpectrumAnimation();
        })
        .catch((err) => {
          console.warn('Resume play() error:', err);
          fallbackSpeechSynthesis();
        });
      return;
    }

    // 3. Otherwise, create a new media element for fresh playback
    stopAllAudio();

    let playUrl: string | null =
      mediaBlobUrlRegistry.get(activeEvaluation.id) ||
      (activeEvaluation.mediaUrl && !activeEvaluation.mediaUrl.startsWith('blob:') ? activeEvaluation.mediaUrl : null);

    if (!playUrl) {
      const rawFile = mediaBlobRegistry.get(activeEvaluation.id);
      if (rawFile) {
        playUrl = URL.createObjectURL(rawFile);
        mediaBlobUrlRegistry.set(activeEvaluation.id, playUrl);
      }
    }

    if (!playUrl && activeEvaluation.mediaUrl) {
      playUrl = activeEvaluation.mediaUrl;
    }

    if (!playUrl) {
      console.warn('No audio media URL found. Using neural speech synthesis fallback.');
      fallbackSpeechSynthesis();
      return;
    }

    const isVideo = activeEvaluation.fileType === 'video';
    const mediaElem = document.createElement(isVideo ? 'video' : 'audio') as HTMLMediaElement;
    mediaElem.src = playUrl;
    mediaElem.volume = isMuted ? 0 : audioVolume;
    mediaElem.muted = isMuted;
    
    mediaElem.style.position = 'fixed';
    mediaElem.style.top = '-9999px';
    mediaElem.style.left = '-9999px';
    mediaElem.style.opacity = '0';
    mediaElem.style.pointerEvents = 'none';
    document.body.appendChild(mediaElem);

    mediaElementRef.current = mediaElem;

    mediaElem.onended = () => stopAllAudio();
    mediaElem.onerror = (e) => {
      if (mediaElem.src) {
        console.warn('Media element error during playback:', mediaElem.error || e);
        fallbackSpeechSynthesis();
      }
    };

    const playPromise = mediaElem.play();

    playPromise
      .then(() => {
        setIsPlayingAudio(true);
        startSpectrumAnimation();

        try {
          const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtxClass();
          audioCtxRef.current = ctx;

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyserRef.current = analyser;

          const source = ctx.createMediaElementSource(mediaElem);
          source.connect(analyser);
          analyser.connect(ctx.destination);

          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }
        } catch (err) {
          console.warn('Web Audio analyser setup skipped/failed:', err);
          analyserRef.current = null;
        }
      })
      .catch((err) => {
        console.warn('play() rejected:', err);
        fallbackSpeechSynthesis();
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => {
            setCurrentView('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
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
        <div className="flex items-center gap-6 p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div>
            <div className={`text-4xl sm:text-5xl font-black tracking-tight ${getScoreColor(activeEvaluation.overallScore).textDark}`}>
              {activeEvaluation.overallScore}%
            </div>
            <div className={`text-xs font-bold mt-0.5 ${getScoreColor(activeEvaluation.overallScore).textDark}`}>
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
                    {isPlayingAudio ? 'Playing speech audio & frequency spectrum...' : 'Click play to hear speech audio playback'}
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
              {liveSpectrum.map((heightPercent, i) => {
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-100 ${
                      isPlayingAudio ? 'bg-gradient-to-t from-teal-500 to-brand-400' : 'bg-slate-700/60'
                    }`}
                    style={{ 
                      height: `${isPlayingAudio ? heightPercent : Math.floor(15 + (i % 5) * 12)}%`
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Overall Score Circular Ring + 6 Dimension Score Cards */}
          {(() => {
            const computedOverall = activeEvaluation.overallScore;
            const overallColors = getScoreColor(computedOverall);

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left Column: Overall Score Circular Ring Card */}
                <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Overall Presentation Score
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Combined average across all 6 core metrics
                    </p>
                  </div>

                  {/* Circular Ring Progress SVG */}
                  <div className="relative w-40 h-40 flex items-center justify-center my-1">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate-100 dark:text-slate-800"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        className={`transition-all duration-1000 ease-out ${overallColors.text}`}
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * computedOverall) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className={`text-4xl font-black tracking-tight ${overallColors.textDark}`}>
                        {computedOverall}%
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

                {/* Right Column: 6 Dimension Score Cards */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(activeEvaluation.metrics).map(([key, val]) => {
                    const colors = getScoreColor(val);
                    return (
                      <div 
                        key={key}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-center space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {METRIC_LABELS[key] || key}
                          </span>
                          <span className={`text-sm font-extrabold ${colors.textDark}`}>
                            {val}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
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
          
          {/* Annotated Transcript Info Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Timestamped Speech & AI Delivery Coaching</span>
                <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-[10px] font-bold border border-brand-200 dark:border-brand-800">
                  FULL TIMELINE
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Displays the <strong>spoken speech sentences</strong> at each timestamp along with <strong>targeted AI speech coaching</strong> to improve your delivery.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Optimal Rhythm</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ml-2" />
              <span>Coaching Alert</span>
            </div>
          </div>

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

            <div className="flex items-center gap-2.5">
              <button
                onClick={toggleMute}
                title={isMuted || audioVolume === 0 ? "Unmute Sound" : "Mute Sound"}
                className="p-2 rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors cursor-pointer flex items-center justify-center"
              >
                {isMuted || audioVolume === 0 ? (
                  <VolumeX className="w-5 h-5 text-rose-500" />
                ) : audioVolume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : audioVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 sm:w-28 h-2 accent-brand-500 cursor-pointer rounded-lg bg-brand-200 dark:bg-brand-800"
                title={`Volume: ${Math.round((isMuted ? 0 : audioVolume) * 100)}%`}
              />
              
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 min-w-[36px] text-right">
                {Math.round((isMuted ? 0 : audioVolume) * 100)}%
              </span>
            </div>
          </div>

          {/* Transcript List */}
          <div className="space-y-4">
            {activeEvaluation.transcript.map((seg, idx) => {
              let coachingTip = "✨ Optimal keynote rhythm and clear vocal articulation.";
              let tipType: 'success' | 'warning' | 'info' = 'success';

              if (seg.hasFiller && seg.fillerWords && seg.fillerWords.length > 0) {
                coachingTip = `⚠️ Filler Alert: Detected conversational filler "${seg.fillerWords.join(', ')}". Replace filler words with 1-second silent pauses.`;
                tipType = 'warning';
              } else if (seg.wpm < 125) {
                coachingTip = `🐢 Pacing Note: Deliberate speaking rate of ${seg.wpm} WPM. Increase vocal energy slightly to maintain audience momentum.`;
                tipType = 'info';
              } else if (seg.wpm > 155) {
                coachingTip = `⚡ Pacing Note: Fast speech velocity of ${seg.wpm} WPM. Take 2-second silent pauses after key slide points.`;
                tipType = 'warning';
              }

              return (
                <div
                  key={seg.id}
                  onClick={() => setActiveSegmentIndex(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    activeSegmentIndex === idx
                      ? 'bg-white dark:bg-slate-900 border-brand-500 shadow-md shadow-brand-500/10'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {seg.startTime}{seg.endTime ? ` - ${seg.endTime}` : (idx < activeEvaluation.transcript.length - 1 ? ` - ${activeEvaluation.transcript[idx + 1].startTime}` : '')}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{seg.speaker}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-[11px]">
                        {seg.wpm} WPM
                      </span>
                    </div>

                    {seg.hasFiller && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1">
                        <span>Filler Detected:</span>
                        <strong className="underline">"{seg.fillerWords?.join(', ')}"</strong>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    "{seg.text}"
                  </p>

                  {/* AI Segment Coaching & Improvement Advice Box */}
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    tipType === 'warning'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      : tipType === 'info'
                      ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                  }`}>
                    <span>{coachingTip}</span>
                  </div>
                </div>
              );
            })}
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

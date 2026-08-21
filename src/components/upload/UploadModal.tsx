import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Mic, 
  FileVideo, 
  FileAudio, 
  FileText, 
  Sparkles, 
  Check, 
  StopCircle, 
  ArrowRight,
  Play
} from 'lucide-react';
import { useEvaluation } from '../../context/EvaluationContext';

interface UploadModalProps {
  onEvaluationComplete: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onEvaluationComplete }) => {
  const { isUploadModalOpen, closeUploadModal, startAIAnalysis } = useEvaluation();

  const [activeTab, setActiveTab] = useState<'upload' | 'record' | 'samples'>('upload');
  const [presentationTitle, setPresentationTitle] = useState('New Rehearsal Session');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: 'video' | 'audio' | 'slides' } | null>(null);
  
  // Microphone recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSampleSelect = (sampleTitle: string, type: 'video' | 'audio' | 'slides', size: string) => {
    setSelectedFile({ name: `${sampleTitle}.${type === 'video' ? 'mp4' : type === 'audio' ? 'wav' : 'pdf'}`, size, type });
    setPresentationTitle(sampleTitle);
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      setSelectedFile({
        name: `Live_Mic_Rehearsal_${new Date().toISOString().slice(0, 10)}.wav`,
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

  const handleStartAnalysis = async () => {
    const finalTitle = presentationTitle.trim() || 'New Presentation Rehearsal';
    const finalFileType = selectedFile?.type || 'video';
    const finalFileSize = selectedFile?.size || '25 MB';
    const finalFileName = selectedFile?.name || 'rehearsal_recording.mp4';

    await startAIAnalysis({
      title: finalTitle,
      fileType: finalFileType,
      fileName: finalFileName,
      fileSize: finalFileSize
    });
    
    onEvaluationComplete();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={closeUploadModal}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-xl p-6 sm:p-8 z-10 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Speech & Slide Ingestion</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Evaluate Presentation
            </h2>
          </div>
          <button
            onClick={closeUploadModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input: Presentation Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Presentation Title
          </label>
          <input 
            type="text"
            value={presentationTitle}
            onChange={(e) => setPresentationTitle(e.target.value)}
            placeholder="e.g. Q4 Executive Board Pitch"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Tabs: Upload / Live Mic / Samples */}
        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'upload' 
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setActiveTab('record')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'record' 
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Live Mic</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'samples' 
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Sample Presets</span>
          </button>
        </div>

        {/* Tab 1: File Dropzone */}
        {activeTab === 'upload' && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center group"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".mp4,.mov,.wav,.mp3,.pdf,.pptx"
              className="hidden" 
              onChange={handleFileSelect}
            />
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              {selectedFile ? selectedFile.name : 'Click to select or drag presentation here'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Supports .mp4, .mov, .wav, .mp3, .pdf, .pptx (Up to 100MB)
            </p>
          </div>
        )}

        {/* Tab 2: Live Recording */}
        {activeTab === 'record' && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <button
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isRecording 
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30' 
                    : 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/30'
                }`}
              >
                {isRecording ? <StopCircle className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
              </button>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mb-1">
              {formatTimer(recordSeconds)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRecording ? 'Recording active... speak into your microphone' : 'Click the microphone button to start rehearsal recording'}
            </p>
          </div>
        )}

        {/* Tab 3: Sample Presets */}
        {activeTab === 'samples' && (
          <div className="space-y-2.5">
            {[
              { title: 'Series A Venture Pitch Deck', type: 'video' as const, size: '42 MB', pace: '140 WPM' },
              { title: 'Keynote Talk: Generative AI Future', type: 'audio' as const, size: '18 MB', pace: '135 WPM' },
              { title: 'Q4 Product Roadmap Slides', type: 'slides' as const, size: '14 MB', pace: '128 WPM' }
            ].map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleSelect(sample.title, sample.type, sample.size)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedFile?.name.includes(sample.title)
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/40 text-brand-600">
                    {sample.type === 'video' ? <FileVideo className="w-4 h-4" /> : sample.type === 'audio' ? <FileAudio className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      {sample.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {sample.type.toUpperCase()} • {sample.size} • Target ~{sample.pace}
                    </div>
                  </div>
                </div>
                {selectedFile?.name.includes(sample.title) && (
                  <Check className="w-4 h-4 text-brand-500" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={closeUploadModal}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleStartAnalysis}
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Analyze</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

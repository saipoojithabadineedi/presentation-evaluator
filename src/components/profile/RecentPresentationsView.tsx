import React, { useState } from 'react';
import { 
  Clock, 
  FileVideo, 
  FileAudio, 
  FileText, 
  Search, 
  Trash2, 
  ExternalLink,
  Plus,
  Play,
  RotateCcw
} from 'lucide-react';
import { useEvaluation } from '../../context/EvaluationContext';
import { ProfileSubNav } from './ProfileSubNav';
import { AppView, EvaluationData } from '../../types';

interface RecentPresentationsViewProps {
  setCurrentView: (view: AppView) => void;
}

export const RecentPresentationsView: React.FC<RecentPresentationsViewProps> = ({ setCurrentView }) => {
  const { evaluations, setActiveEvaluation, openUploadModal, deleteEvaluation } = useEvaluation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'slides'>('all');

  const filtered = evaluations.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || e.fileType === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenEvaluation = (item: EvaluationData) => {
    setActiveEvaluation(item);
    setCurrentView('evaluation');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Recent Presentations & Rehearsals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            File library of all uploaded presentation files, videos, audios, and slide decks
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search presentation files..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            {(['all', 'video', 'audio', 'slides'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filterType === type 
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Files Grid (Matches Sketch: [file] [file] [file]) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenEvaluation(item)}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between cursor-pointer space-y-4 group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center">
                {item.fileType === 'video' ? <FileVideo className="w-6 h-6" /> : item.fileType === 'audio' ? <FileAudio className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
              </div>
              <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/80 px-2.5 py-1 rounded-xl border border-brand-100 dark:border-brand-900">
                {item.overallScore}%
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {item.formattedDate} • {item.duration} • {item.fileSize}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                Pace: <span className="font-bold text-slate-800 dark:text-slate-200">{item.averageCadence} WPM</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEvaluation(item.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete presentation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Report <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
          <p className="text-slate-500">No presentations found matching your search.</p>
          <button
            onClick={openUploadModal}
            className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs"
          >
            Upload Presentation
          </button>
        </div>
      )}

    </div>
  );
};

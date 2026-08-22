import React, { useState } from 'react';
import { 
  BarChart3, 
  Search, 
  ChevronRight,
  TrendingUp,
  FileCheck,
  Award
} from 'lucide-react';
import { useEvaluation } from '../../context/EvaluationContext';
import { ProfileSubNav } from './ProfileSubNav';
import { AppView, EvaluationData } from '../../types';

interface AllEvaluationsViewProps {
  setCurrentView: (view: AppView) => void;
}

export const AllEvaluationsView: React.FC<AllEvaluationsViewProps> = ({ setCurrentView }) => {
  const { evaluations, setActiveEvaluation, openUploadModal } = useEvaluation();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const filtered = evaluations.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesTier = selectedTier === 'all' || item.scoreTier.includes(selectedTier);
    return matchesSearch && matchesTier;
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
            All Presentation Evaluations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete archive of AI-analyzed rehearsal sessions, delivery scores, and diagnostic benchmarks
          </p>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter evaluations..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="5%">Top 5%</option>
            <option value="10%">Top 10%</option>
          </select>
        </div>
      </div>

      {/* Evaluations List (Matches Sketch: "All the presentation evaluation") */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenEvaluation(item)}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-brand-500/60 dark:hover:border-brand-500/60 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex flex-col items-center justify-center font-black text-lg shrink-0 ring-1 ring-brand-500/20">
                <span>{item.overallScore}%</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">Score</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-brand-600 transition-colors">
                  {item.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{item.formattedDate}</span>
                  <span>•</span>
                  <span>{item.duration}</span>
                  <span>•</span>
                  <span className="text-brand-600 font-semibold">{item.averageCadence} WPM</span>
                  <span>•</span>
                  <span>{item.fillerWordRate}% Fillers</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                {item.scoreTier}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEvaluation(item);
                }}
                className="px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-500 hover:text-white text-brand-700 dark:text-brand-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>View Evaluation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

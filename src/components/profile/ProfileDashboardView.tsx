import React from 'react';
import { 
  TrendingUp, 
  Mic, 
  CheckCircle2, 
  Presentation, 
  Award, 
  Calendar, 
  ArrowUpRight, 
  Sparkles,
  Zap,
  Target,
  FileText,
  Clock,
  Settings,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useEvaluation } from '../../context/EvaluationContext';
import { ProfileSubNav } from './ProfileSubNav';
import { AppView } from '../../types';

interface ProfileDashboardViewProps {
  setCurrentView: (view: AppView) => void;
}

export const ProfileDashboardView: React.FC<ProfileDashboardViewProps> = ({ setCurrentView }) => {
  const { user } = useAuth();
  const { evaluations, reports, openUploadModal, setActiveEvaluation } = useEvaluation();

  // Performance history trend data
  const performanceHistory = [
    { session: 'S1', score: 82, wpm: 120 },
    { session: 'S2', score: 85, wpm: 126 },
    { session: 'S3', score: 84, wpm: 130 },
    { session: 'S4', score: 88, wpm: 132 },
    { session: 'S5', score: 87, wpm: 136 },
    { session: 'S6', score: 91, wpm: 135 },
    { session: 'S7', score: 89, wpm: 138 },
    { session: 'S8', score: 94, wpm: 141 },
    { session: 'S9', score: 92, wpm: 138 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Shared Profile Sub-Navigation */}
      <ProfileSubNav currentView="dashboard" setCurrentView={setCurrentView} />

      {/* User Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative">
            <img 
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
              alt={user?.name || "User"}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-500/20"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {user?.name || "User"}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                {user?.tier || "Top 5% speaker tier"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {user?.email || "name@example.com"} • Active Rehearsal Member • 14 Certified Sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('settings')}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Summary Score Boxes (Matches Sketch: [Total] [Avg S] [..]) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => setCurrentView('recent-presentations')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs card-hover cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rehearsals</span>
            <Clock className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {user?.totalEvaluations || 14}
          </div>
          <div className="text-[11px] text-brand-600 font-bold mt-1">5.4 Practice Hours →</div>
        </div>

        <div 
          onClick={() => setCurrentView('all-evaluations')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs card-hover cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Score</span>
            <TrendingUp className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-1">
            {user?.averageScore || 92}%
          </div>
          <div className="text-[11px] text-brand-600 font-bold mt-1">+8.4% improvement →</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Cadence</span>
            <Mic className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {user?.averageCadence || 135} <span className="text-xs text-slate-400">WPM</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Target: 125–150 WPM</div>
        </div>

        <div 
          onClick={() => setCurrentView('reports-archive')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs card-hover cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filler Word Avg</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {user?.fillerWordRate || 0.8}%
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">View {reports.length} PDF Reports →</div>
        </div>

      </div>

      {/* Performance Overview Section (Matches Sketch: "Performance overview") */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Performance Overview & Growth Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical overall delivery score progression across recent rehearsal evaluations
            </p>
          </div>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800 w-fit">
            Consistent High Performer
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="session" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[70, 100]} stroke="#94a3b8" fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  backgroundColor: '#0f172a', 
                  border: 'none', 
                  color: '#fff',
                  fontSize: '12px' 
                }} 
                formatter={(val: number) => [`${val}%`, 'Overall Score']}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#scoreGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Access Sections to the 4 other Profile Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Presentation Quick Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Clock className="w-4 h-4 text-brand-500" />
              <h3>Recent Presentations</h3>
            </div>
            <button
              onClick={() => setCurrentView('recent-presentations')}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {evaluations.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveEvaluation(item);
                  setCurrentView('evaluation');
                }}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                  <div className="text-[11px] text-slate-400">{item.date} • {item.averageCadence} WPM</div>
                </div>
                <span className="text-xs font-extrabold text-brand-600 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg shadow-2xs">
                  {item.overallScore}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reports Quick Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <FileText className="w-4 h-4 text-brand-500" />
              <h3>PDF Reports Archive</h3>
            </div>
            <button
              onClick={() => setCurrentView('reports-archive')}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View Archive</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {reports.slice(0, 2).map((rep) => (
              <div
                key={rep.id}
                onClick={() => setCurrentView('reports-archive')}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{rep.title}</div>
                  <div className="text-[11px] text-slate-400">{rep.generatedDate} • Ready for PDF export</div>
                </div>
                <span className="text-xs font-extrabold text-teal-600 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg shadow-2xs">
                  {rep.overallScore}%
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

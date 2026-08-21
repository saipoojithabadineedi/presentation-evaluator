import React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvaluation } from '../../context/EvaluationContext';
import { AppView } from '../../types';

interface ProfileSubNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

export const ProfileSubNav: React.FC<ProfileSubNavProps> = ({ currentView, setCurrentView }) => {
  const { logout } = useAuth();
  const { openUploadModal } = useEvaluation();

  const navTabs = [
    { id: 'dashboard' as AppView, label: 'Profile Dashboard', icon: LayoutDashboard },
    { id: 'recent-presentations' as AppView, label: 'Recent Presentation', icon: Clock },
    { id: 'all-evaluations' as AppView, label: 'Evaluation', icon: BarChart3 },
    { id: 'reports-archive' as AppView, label: 'Reports', icon: FileText },
    { id: 'settings' as AppView, label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    setCurrentView('landing');
  };

  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Page</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={openUploadModal}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Evaluation</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Horizontal Tabs Header */}
      <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto gap-1">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm border border-slate-200/50 dark:border-slate-600/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-750'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

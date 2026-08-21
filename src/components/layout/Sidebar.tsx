import React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  X, 
  ChevronRight,
  Sparkles,
  Award,
  Plus,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useEvaluation } from '../../context/EvaluationContext';
import { AppView } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isDesktopStatic?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  setCurrentView,
  isDesktopStatic = false
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openUploadModal } = useEvaluation();

  const navItems = [
    {
      id: 'dashboard' as AppView,
      label: 'Profile Dashboard',
      subtitle: 'Overview & performance analytics',
      icon: LayoutDashboard
    },
    {
      id: 'recent-presentations' as AppView,
      label: 'Recent Presentation',
      subtitle: 'Uploaded rehearsal files & media',
      icon: Clock
    },
    {
      id: 'all-evaluations' as AppView,
      label: 'Evaluation',
      subtitle: 'All presentation evaluations & scores',
      icon: BarChart3
    },
    {
      id: 'reports-archive' as AppView,
      label: 'Reports',
      subtitle: 'PDF reports for each evaluation',
      icon: FileText
    },
    {
      id: 'settings' as AppView,
      label: 'Settings',
      subtitle: 'Speech goals, pacing & AI preferences',
      icon: Settings
    }
  ];

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    if (!isDesktopStatic) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentView('landing');
    if (!isDesktopStatic) {
      onClose();
    }
  };

  // Content of the Sidebar
  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
      
      {/* Top Header & Brand */}
      <div>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button 
            onClick={() => handleNavigate('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <img 
              src="/assets/logo.jpg" 
              alt="Presentation Evaluator" 
              className="h-10 w-auto object-contain rounded-md shadow-xs transition-transform group-hover:scale-105"
            />
          </button>

          {!isDesktopStatic && (
            <button 
              onClick={onClose}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Profile Card on the Left */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/40">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img 
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
                alt={user?.name || "User"}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                {user?.name || "John Doe"}
              </h3>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1 mt-0.5 truncate">
                <Award className="w-3 h-3 shrink-0" />
                <span>{user?.tier || "Top 5% speaker tier"}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Button: New Evaluation */}
          <button
            onClick={openUploadModal}
            className="w-full mt-3.5 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Evaluation</span>
          </button>
        </div>

        {/* Navigation Items on the Left */}
        <nav className="p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Profile Navigation Hub
          </p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                  isActive 
                    ? 'bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 font-bold shadow-2xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    isActive 
                      ? 'bg-brand-500 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">{item.label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{item.subtitle}</div>
                  </div>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-brand-500' : 'text-slate-300 dark:text-slate-600'}`} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Theme Switcher & Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {/* Theme button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
        >
          <span className="flex items-center gap-2">
            {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-400" />}
            <span className="capitalize">{theme} Theme</span>
          </span>
          <span className="text-[10px] text-slate-400">Toggle</span>
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );

  // If rendering on Desktop as static left sidebar:
  if (isDesktopStatic) {
    return (
      <aside className="hidden md:flex w-72 lg:w-80 flex-col shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>
    );
  }

  // Mobile drawer opening from the LEFT (inset-y-0 left-0)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer on the LEFT side */}
      <aside className="absolute inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-xs shadow-2xl animate-in slide-in-from-left duration-200">
          {sidebarContent}
        </div>
      </aside>
    </div>
  );
};

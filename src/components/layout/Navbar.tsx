import React from 'react';
import { Moon, Plus, LogOut, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useEvaluation } from '../../context/EvaluationContext';
import { AppView } from '../../types';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, onOpenSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { openUploadModal } = useEvaluation();

  const handleLogout = () => {
    logout();
    setCurrentView('landing');
  };

  const isAuthPage = currentView === 'login' || currentView === 'register';
  const isLandingPage = currentView === 'landing';
  const isInApp = isAuthenticated && !isAuthPage && !isLandingPage;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Left Side: Mobile Menu Button + Brand Logo (on public pages) */}
        <div className="flex items-center gap-3">
          {isInApp && (
            <button
              onClick={onOpenSidebar}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-colors"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button 
            onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'landing')}
            className={`flex items-center gap-3 text-left focus:outline-none group ${isInApp ? 'md:hidden' : ''}`}
          >
            <img 
              src="/assets/logo.jpg" 
              alt="Presentation Evaluator" 
              className="h-10 w-auto object-contain rounded-md shadow-xs transition-transform group-hover:scale-105"
            />
          </button>
        </div>

        {/* Right Navigation & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Theme Toggle Pill Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
          >
            {theme === 'light' ? (
              <>
                <span className="text-amber-500 text-sm">☀️</span>
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Landing / Auth Nav Links */}
          {(!isAuthenticated || isLandingPage || isAuthPage) && (
            <div className="flex items-center gap-2 sm:gap-4 text-sm font-medium">
              {currentView !== 'landing' && (
                <button
                  onClick={() => setCurrentView('landing')}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Home
                </button>
              )}

              {currentView !== 'login' && (
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Sign In
                </button>
              )}

              {currentView !== 'register' && (
                <button
                  onClick={() => setCurrentView('register')}
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-medium shadow-sm transition-all"
                >
                  Sign Up
                </button>
              )}
            </div>
          )}

          {/* Authenticated Controls */}
          {isInApp && (
            <div className="flex items-center gap-3">
              <button
                onClick={openUploadModal}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Evaluation</span>
              </button>

              <div className="hidden sm:flex items-center gap-2.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <img 
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
                  alt={user?.name || "User"}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-500/30"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {user?.name || "User"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

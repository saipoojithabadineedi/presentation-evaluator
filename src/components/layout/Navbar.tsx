import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppView } from '../../types';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, onOpenSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentView('landing');
  };

  const isAuthPage = currentView === 'login' || currentView === 'register';
  const isLandingPage = currentView === 'landing';
  const isProfileSection = currentView === 'profile' || 
                           currentView === 'recent-presentations' || 
                           currentView === 'all-evaluations' || 
                           currentView === 'reports-archive' || 
                           currentView === 'settings';
  const isInApp = isAuthenticated && !isAuthPage && !isLandingPage;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Left Side: Mobile Menu Button + Brand Logo (Always visible) */}
        <div className="flex items-center gap-3">
          {isInApp && isProfileSection && (
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
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <img 
              src="/assets/logo.jpg" 
              alt="Presentation Evaluator - Analyze. Improve. Succeed." 
              className="h-10 sm:h-12 w-auto object-contain logo-blend transition-transform group-hover:scale-105"
            />
          </button>
        </div>

        {/* Right Navigation & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Landing / Auth Nav Links */}
          {(!isAuthenticated || isAuthPage) && (
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

          {/* Authenticated Controls on Landing Page */}
          {isAuthenticated && isLandingPage && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-xs transition-all"
              >
                Go to Upload
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 hover:bg-brand-50/50 transition-all cursor-pointer group"
                title="View Profile & User Details"
              >
                <img 
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
                  alt={user?.name || "User"}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-500/30"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600">
                  Profile ({user?.name})
                </span>
              </button>
            </div>
          )}

          {/* Authenticated Controls */}
          {isInApp && (
            <div className="flex items-center gap-3">
              
              {/* Point 3: Top Right Profile Badge opens Settings / Profile & User Details page */}
              <button
                onClick={() => setCurrentView('settings')}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-slate-750 transition-all cursor-pointer group shadow-2xs"
                title="Click to view Profile Details & User Settings"
              >
                <img 
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
                  alt={user?.name || "User"}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-500/30 group-hover:scale-105 transition-transform"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {user?.name || "User"}
                </span>
              </button>

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

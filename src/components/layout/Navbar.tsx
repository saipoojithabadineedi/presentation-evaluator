import React, { useState, useRef, useEffect } from 'react';
import { Menu, BarChart2, Bell, LogOut, CheckCircle2, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvaluation } from '../../context/EvaluationContext';
import { AppView } from '../../types';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, onOpenSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { evaluations, setActiveEvaluation } = useEvaluation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const notificationRef = useRef<HTMLDivElement>(null);

  const isAuthPage = currentView === 'login' || currentView === 'register';
  const isLandingPage = currentView === 'landing';
  const isProfileSection = currentView === 'profile' || 
                           currentView === 'recent-presentations' || 
                           currentView === 'all-evaluations' || 
                           currentView === 'reports-archive';
  const isInApp = isAuthenticated && !isAuthPage && !isLandingPage;

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateAndScroll = (elementId?: string) => {
    if (currentView !== 'dashboard') {
      setCurrentView('dashboard');
    }
    setTimeout(() => {
      if (!elementId || elementId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const elem = document.getElementById(elementId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 80);
  };

  const notificationsList = evaluations.length > 0 
    ? evaluations.slice(0, 5).map((ev, idx) => ({
        id: ev.id,
        title: idx === 0 ? 'Latest Presentation Ready' : 'Rehearsal Analyzed',
        desc: `"${ev.title}" scored ${ev.overallScore}% (${ev.averageCadence} WPM cadence).`,
        time: ev.formattedDate || 'Recently',
        icon: CheckCircle2,
        color: 'text-emerald-500',
        evalData: ev
      }))
    : [
        {
          id: 'preset-1',
          title: 'Speech Coach Active',
          desc: 'Upload a rehearsal recording or use live mic to view AI benchmarks.',
          time: 'Ready',
          icon: Award,
          color: 'text-brand-500',
          evalData: null
        }
      ];

  const handleNotificationClick = (item: any) => {
    if (item.evalData) {
      setActiveEvaluation(item.evalData);
      setCurrentView('evaluation');
    }
    setShowNotifications(false);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasUnread(false);
  };

  const renderNotificationsPopover = () => (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Notifications</h4>
          {hasUnread && (
            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
              {notificationsList.length} New
            </span>
          )}
        </div>
        {hasUnread && (
          <button 
            type="button"
            onClick={handleMarkAllRead}
            className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-semibold cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notificationsList.map((n: any) => {
          const Icon = n.icon;
          return (
            <div 
              key={n.id} 
              onClick={() => handleNotificationClick(n)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-50/60 dark:hover:bg-slate-800 transition-colors flex items-start gap-3 text-xs cursor-pointer group"
            >
              <Icon className={`w-4 h-4 ${n.color} shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {n.title}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] leading-tight">
                  {n.desc}
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">
                  {n.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between gap-4">
        
        {/* Left Side: Mobile Menu Button + Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
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
            className="flex items-center gap-3 text-left focus:outline-none group py-1"
          >
            <img 
              src="/assets/logo.jpg" 
              alt="Presentation Evaluator - Analyze. Improve. Succeed." 
              className="h-16 sm:h-20 lg:h-22 w-auto max-h-20 sm:max-h-22 object-contain logo-blend transition-transform group-hover:scale-105"
            />
          </button>
        </div>

        {/* Center: In-App Hyperlinks (Home, How it works, Why Presentation Evaluator, Who can use it, Contact us) */}
        {isInApp && (
          <nav className="hidden md:flex items-center gap-1 lg:gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => navigateAndScroll('home')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/60 font-black'
                  : 'hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigateAndScroll('features')}
              className="px-3 py-1.5 rounded-xl hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all cursor-pointer whitespace-nowrap"
            >
              Features
            </button>
            <button
              onClick={() => navigateAndScroll('how-it-works')}
              className="px-3 py-1.5 rounded-xl hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all cursor-pointer whitespace-nowrap"
            >
              How It Works
            </button>
            <button
              onClick={() => navigateAndScroll('why-presentation-evaluator')}
              className="px-3 py-1.5 rounded-xl hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all cursor-pointer whitespace-nowrap"
            >
              Why Presentation Evaluator
            </button>
            <button
              onClick={() => navigateAndScroll('who-can-use-it')}
              className="px-3 py-1.5 rounded-xl hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all cursor-pointer whitespace-nowrap"
            >
              Who Can Use It
            </button>
            <button
              onClick={() => {
                const footer = document.getElementById('footer');
                if (footer) {
                  footer.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-3 py-1.5 rounded-xl hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all cursor-pointer whitespace-nowrap"
            >
              Contact Us
            </button>
          </nav>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center gap-3 shrink-0">
          
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
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-xs transition-all"
              >
                Go to Upload
              </button>
              
              {/* 1. Profile Dashboard Button */}
              <button
                onClick={() => setCurrentView('profile')}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-xs group"
                title="View Profile Performance Analytics & Overall Scores"
              >
                <BarChart2 className="w-4 h-4 text-brand-500 group-hover:scale-110 transition-transform" />
                <span>Profile Dashboard</span>
              </button>

              {/* 2. Notification Symbol Button */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 transition-all cursor-pointer relative shadow-2xs group"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  )}
                </button>

                {showNotifications && renderNotificationsPopover()}
              </div>

              {/* 3. Profile Settings Circle Button */}
              <button
                onClick={() => setCurrentView('settings')}
                className="w-9 h-9 rounded-full border border-brand-500/40 hover:border-brand-500 ring-2 ring-brand-500/20 shadow-2xs hover:scale-105 transition-all cursor-pointer overflow-hidden bg-white dark:bg-slate-800 shrink-0"
                title="Profile Settings"
              >
                <img 
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                />
              </button>

              {/* 4. Logout Button (Symbol ONLY, No Text) */}
              <button
                onClick={() => {
                  logout();
                  setCurrentView('landing');
                }}
                className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer shadow-2xs group shrink-0"
                title="Logout of account"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>
            </div>
          )}

          {/* Authenticated Controls In-App: Profile Dashboard -> Notification -> Profile Settings -> Logout (Symbol Only) */}
          {isInApp && (
            <div className="flex items-center gap-2.5">
              {/* 1. Profile Dashboard Button */}
              <button
                onClick={() => setCurrentView('profile')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold tracking-wide transition-all cursor-pointer flex items-center gap-2 border shadow-xs group ${
                  isProfileSection
                    ? 'bg-brand-500 text-white border-brand-500 shadow-brand-500/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400'
                }`}
                title="View Profile Performance Analytics & Overall Scores"
              >
                <BarChart2 className={`w-4 h-4 ${isProfileSection ? 'text-white' : 'text-brand-500 group-hover:scale-110'} transition-transform`} />
                <span>Profile Dashboard</span>
              </button>

              {/* 2. Notification Symbol Button (Between Profile Dashboard and Profile Settings) */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 transition-all cursor-pointer relative shadow-2xs group"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  )}
                </button>

                {showNotifications && renderNotificationsPopover()}
              </div>

              {/* 3. Profile Settings Circle Button */}
              <button
                onClick={() => setCurrentView('settings')}
                className={`w-9 h-9 rounded-full border ring-2 shadow-2xs hover:scale-105 transition-all cursor-pointer overflow-hidden bg-white dark:bg-slate-800 shrink-0 ${
                  currentView === 'settings'
                    ? 'border-brand-500 ring-brand-500/50 scale-105'
                    : 'border-brand-500/40 hover:border-brand-500 ring-brand-500/20'
                }`}
                title="Click to view Profile Settings"
              >
                <img 
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                />
              </button>

              {/* 4. Logout Button (Symbol ONLY, No Text) */}
              <button
                onClick={() => {
                  logout();
                  setCurrentView('landing');
                }}
                className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer shadow-2xs group shrink-0"
                title="Logout of account"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

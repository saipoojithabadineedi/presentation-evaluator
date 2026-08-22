import React, { useEffect } from 'react';
import { CheckCircle2, LogOut, Sparkles, X } from 'lucide-react';

interface AuthToastNotificationProps {
  isOpen: boolean;
  message: string;
  type: 'login' | 'logout';
  onClose: () => void;
}

export const AuthToastNotification: React.FC<AuthToastNotificationProps> = ({
  isOpen,
  message,
  type,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-6 fade-in duration-300">
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3.5 max-w-sm ring-1 ${
        type === 'login' 
          ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 ring-emerald-500/30' 
          : 'bg-slate-900/90 border-slate-700 text-slate-100 ring-slate-600/30'
      }`}>
        <div className={`p-2.5 rounded-xl shrink-0 ${
          type === 'login' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-500/20 text-brand-400'
        }`}>
          {type === 'login' ? (
            <CheckCircle2 className="w-5 h-5 animate-pulse" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{type === 'login' ? 'Authentication Success' : 'Session Ended'}</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

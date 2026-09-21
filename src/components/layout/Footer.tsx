import React from 'react';
import { Sparkles, Shield, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Logo Column */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/logo.jpg" 
                alt="Presentation Evaluator" 
                className="h-10 w-auto object-contain logo-blend"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              AI-Powered Speech & Presentation Evaluation Engine. Analyze pitch, pacing, slide balance, and delivery in seconds.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Analyze. Improve. Succeed.</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Evaluation Hub
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="hover:text-brand-600 cursor-pointer transition-colors">Video & File Upload</li>
              <li className="hover:text-brand-600 cursor-pointer transition-colors">Live Mic Rehearsal</li>
              <li className="hover:text-brand-600 cursor-pointer transition-colors">Google Gemini LLM Analysis</li>
              <li className="hover:text-brand-600 cursor-pointer transition-colors">Web Audio Signal Processor</li>
            </ul>
          </div>

          {/* Analytics Column */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Speaker Performance
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="hover:text-brand-600 cursor-pointer transition-colors">Profile Dashboard Overview</li>
              <li className="hover:text-brand-600 cursor-pointer transition-colors">Cadence (WPM) Benchmarks</li>
              <li className="hover:text-brand-600 cursor-pointer transition-colors">Filler Word Detection</li>
              <li className="hover:text-brand-600 cursor-pointer transition-colors">PDF Export Archives</li>
            </ul>
          </div>

          {/* Trust & Benchmarks Column */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Speech Science Standard
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Trained on international keynote speech benchmarks (125-150 WPM) and slide readability heuristics.
            </p>
            <div className="pt-1 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              <span className="hover:text-brand-600 cursor-pointer transition-colors">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-brand-600 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <div>
            © 2026 <span className="font-semibold text-slate-700 dark:text-slate-300">Presentation Evaluator</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with precision for speakers worldwide</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
};

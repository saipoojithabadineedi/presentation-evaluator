import React from 'react';
import { ArrowRight, Sparkles, Sliders, Presentation, Mic, TrendingUp, CheckCircle } from 'lucide-react';
import { AppView } from '../../types';

interface LandingPageProps {
  setCurrentView: (view: AppView) => void;
  onQuickDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentView, onQuickDemo }) => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        {/* Official Brand Logo Banner */}
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/logo.jpg" 
            alt="Presentation Evaluator - Analyze. Improve. Succeed." 
            className="h-20 sm:h-28 max-w-full w-auto object-contain drop-shadow-md transition-transform hover:scale-105"
          />
        </div>

        {/* AI Tag Pill (Matches Screenshot) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-8 backdrop-blur-xs shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>AI–powered speech & presentation evaluations</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
          Your Perfect <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-teal-500 via-brand-500 to-emerald-500 bg-clip-text text-transparent">
            Presentation in Seconds
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          Stop guessing. Get a personalized speech delivery analysis built by AI, tailored to your goals, cadence, and schedule.
        </p>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => setCurrentView('register')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 flex items-center justify-center gap-2 transition-all group"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => setCurrentView('login')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-xs transition-all"
          >
            Sign In
          </button>
        </div>

      </section>

      {/* Feature Section ("Why Presentation Evaluator?") */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Why Presentation Evaluator?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            We combine speech science with AI to create evaluations that actually work for you.
          </p>
        </div>

        {/* 4 Cards Grid (Matches Screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: AI-Powered Plans */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 shadow-xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900/60 flex items-center justify-center mb-6">
                <Sliders className="w-6 h-6 text-brand-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2.5">
                AI-Powered Plans
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Get an evaluation program tailored to your goals, experience, and speech schedule.
              </p>
            </div>
          </div>

          {/* Card 2: Goal-Oriented */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 shadow-xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900/60 flex items-center justify-center mb-6">
                <Presentation className="w-6 h-6 text-brand-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2.5">
                Goal-Oriented
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Whether you want to pitch investors, deliver keynotes, or debate — we optimize for your goal.
              </p>
            </div>
          </div>

          {/* Card 3: Flexible Pacing */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 shadow-xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900/60 flex items-center justify-center mb-6">
                <Mic className="w-6 h-6 text-brand-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2.5">
                Flexible Pacing
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Real-time WPM cadence analysis and filler word elimination that adapts to your rehearsal.
              </p>
            </div>
          </div>

          {/* Card 4: Time-Efficient */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 shadow-xs card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900/60 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-brand-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2.5">
                Time-Efficient
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Every evaluation is designed to maximize results and confidence in your available time.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

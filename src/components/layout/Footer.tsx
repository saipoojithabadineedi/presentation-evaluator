import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          © 2026 <span className="font-semibold text-slate-600 dark:text-slate-400">Presentation Evaluator</span> • Analyze. Improve. Succeed. All rights reserved.
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="hover:text-brand-600 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-brand-600 cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-brand-600 cursor-pointer transition-colors">Speech Science Benchmarks</span>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { 
  User, 
  Sliders, 
  Save, 
  Check, 
  Sparkles,
  Sun,
  Moon,
  Volume2,
  Award,
  BarChart2,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvaluation } from '../../context/EvaluationContext';
import { useTheme } from '../../context/ThemeContext';
import { AppView } from '../../types';

interface SettingsViewProps {
  setCurrentView: (view: AppView) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ setCurrentView }) => {
  const { user, updateUserProfile, logout } = useAuth();
  const { settings, updateSettings } = useEvaluation();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || 'User');
  const [email, setEmail] = useState(user?.email || 'name@example.com');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80');
  const [minWpm, setMinWpm] = useState(settings.targetMinWpm);
  const [maxWpm, setMaxWpm] = useState(settings.targetMaxWpm);
  const [aiStrictness, setAiStrictness] = useState(settings.aiStrictness);
  const [speechGoal, setSpeechGoal] = useState(settings.speechGoal);
  const [fillerAlerts, setFillerAlerts] = useState(settings.enableFillerAlerts);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAvatarUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, avatarUrl });
    updateSettings({
      targetMinWpm: minWpm,
      targetMaxWpm: maxWpm,
      aiStrictness,
      speechGoal,
      enableFillerAlerts: fillerAlerts
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Controls: Back to Home Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-brand-500" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Header Banner & Profile Details */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img 
            src={avatarUrl} 
            alt={name} 
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-500/20 shadow-xs"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {name}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                {user?.tier || "Top 5% speaker tier"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {email}
            </p>
          </div>
        </div>

        {/* Point 3: Dashboard appears when clicking View Profile Dashboard button */}
        <button
          onClick={() => setCurrentView('profile')}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all shrink-0"
        >
          <BarChart2 className="w-4 h-4" />
          <span>View Profile Dashboard</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Details & Photo Upload */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-brand-500" />
            <h2>Speaker Profile Details & Photo</h2>
          </div>

          {/* Profile Picture Uploader */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <img 
              src={avatarUrl} 
              alt="Profile Preview" 
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/20 shadow-xs"
            />
            <div className="space-y-2 text-center sm:text-left">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Change Profile Picture
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs inline-block">
                  Upload Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>
                <span className="text-xs text-slate-400">or pick preset:</span>
                <div className="flex items-center gap-1.5">
                  {sampleAvatars.map((url, idx) => (
                    <img 
                      key={idx}
                      src={url} 
                      alt={`Avatar ${idx+1}`}
                      onClick={() => setAvatarUrl(url)}
                      className={`w-7 h-7 rounded-lg object-cover cursor-pointer transition-transform hover:scale-110 ${
                        avatarUrl === url ? 'ring-2 ring-brand-500 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Speech Goals & Cadence Targets */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <Sliders className="w-4 h-4 text-brand-500" />
            <h2>Speech Cadence & AI Benchmarks</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Rehearsal Goal
              </label>
              <select
                value={speechGoal}
                onChange={(e: any) => setSpeechGoal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
              >
                <option value="pitch">Investor Pitch (Concise & High Energy)</option>
                <option value="keynote">Keynote & Public Address (Rhythmic Pacing)</option>
                <option value="lecture">Academic & Technical Lecture</option>
                <option value="conference">Virtual Conference Talk</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                AI Evaluation Strictness
              </label>
              <select
                value={aiStrictness}
                onChange={(e: any) => setAiStrictness(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
              >
                <option value="lenient">Lenient (Beginner Speaker)</option>
                <option value="standard">Standard (Professional Keynote)</option>
                <option value="rigorous">Rigorous (Executive / TED Style)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Optimal WPM Target Range ({minWpm} – {maxWpm} WPM)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="100"
                max="140"
                value={minWpm}
                onChange={(e) => setMinWpm(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <input
                type="range"
                min="140"
                max="180"
                value={maxWpm}
                onChange={(e) => setMaxWpm(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Account Session & Logout Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Account Session & Security</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sign out of your active Presentation Evaluator session on this browser.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              setCurrentView('landing');
            }}
            className="px-5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>

      </form>
    </div>
  );
};

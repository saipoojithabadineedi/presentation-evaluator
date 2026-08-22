import React, { useState } from 'react';
import { 
  User, 
  Sliders, 
  Save, 
  Check, 
  Sparkles,
  Sun,
  Moon,
  Volume2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvaluation } from '../../context/EvaluationContext';
import { useTheme } from '../../context/ThemeContext';
import { ProfileSubNav } from './ProfileSubNav';
import { AppView } from '../../types';

interface SettingsViewProps {
  setCurrentView: (view: AppView) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ setCurrentView }) => {
  const { user, updateUserProfile } = useAuth();
  const { settings, updateSettings } = useEvaluation();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || 'User');
  const [email, setEmail] = useState(user?.email || 'name@example.com');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '9876543210');
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
    updateUserProfile({ name, email, phoneNumber, avatarUrl });
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Shared Profile Sub-Navigation */}
      <ProfileSubNav currentView="settings" setCurrentView={setCurrentView} />

      <div className="pt-2">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Application & Speech Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure speech goals, cadence thresholds, audio sensitivity, and speaker profile details
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Details & Photo Upload */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-brand-500" />
            <h2>Speaker Profile & Avatar Photo</h2>
          </div>

          {/* Profile Picture Uploader */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <img 
              src={avatarUrl} 
              alt="Profile Preview" 
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-500/20 shadow-xs"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210"
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

        {/* Appearance & Preferences */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Interface Theme</div>
              <div className="text-xs text-slate-400">Toggle between Light and Dark display mode</div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-400" />}
              <span className="capitalize">{theme} Mode</span>
            </button>
          </div>
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

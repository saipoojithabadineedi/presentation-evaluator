import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight, Check, AlertCircle, Users, Lightbulb, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppView } from '../../types';

interface RegisterFormProps {
  setCurrentView: (view: AppView) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ setCurrentView }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password Strength Criteria Evaluation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password does not meet all security rules. Please follow the checklist below.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register(fullName, email, password);
      if (!res.success) {
        setError(res.error || 'Registration failed.');
        return;
      }

      // Dispatch welcome confirmation email to user's registered inbox
      try {
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), name: fullName.trim() || 'User' })
        });
      } catch (welcomeErr) {
        console.warn('Welcome email dispatch notice:', welcomeErr);
      }

      localStorage.setItem('pe_full_name_' + email.trim().toLowerCase(), fullName.trim());
      localStorage.setItem('pe_last_login_credential', email.trim());
      localStorage.setItem('pe_remembered_credentials', email.trim());
      localStorage.setItem('pe_reg_success_msg', 'Account registered successfully! A welcome confirmation has been sent to your email (check your Spam/Updates folder if not in Inbox).');
      setCurrentView('login');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#032a21] dark:bg-slate-950 transition-colors">
      
      {/* Subscreen Frame (Matches Image Right Card) */}
      <div className="w-full max-w-6xl bg-gradient-to-br from-[#064e3b] via-[#044c3c] to-[#022c22] rounded-[32px] sm:rounded-[40px] border border-emerald-800/80 shadow-2xl overflow-hidden relative p-6 sm:p-8 lg:p-10">
        
        {/* Decorative Forest Glow Shapes */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#059669]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Side: Community Narrative, Value Pillars & Learner Illustration */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            
            {/* Brand Logo */}
            <div className="flex items-center">
              <img 
                src="/assets/auth_logo_dark.png" 
                alt="Presentation Evaluator - Analyze. Improve. Succeed." 
                className="h-11 sm:h-13 w-auto object-contain"
              />
            </div>

            {/* Headline & Description */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Join Our <br />
                <span className="text-[#6ee7b7]">Community</span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-md leading-relaxed">
                Create an account and start improving your presentation skills with AI-powered evaluation.
              </p>
            </div>

            {/* 3 Pillars */}
            <div className="space-y-3 max-w-md">
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-800/80 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-600/40 shadow-2xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Join a Growing Community</h4>
                  <p className="text-[11px] sm:text-xs text-emerald-200/80">Connect with learners worldwide</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-800/80 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-600/40 shadow-2xs">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Get Personalized Feedback</h4>
                  <p className="text-[11px] sm:text-xs text-emerald-200/80">AI insights tailored to you</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-800/80 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-600/40 shadow-2xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Track Your Growth</h4>
                  <p className="text-[11px] sm:text-xs text-emerald-200/80">See your improvement journey</p>
                </div>
              </div>

            </div>

            {/* Learner Illustration (User Full HD Artwork) */}
            <div className="hidden sm:flex items-center justify-start pt-2 -mb-6 sm:-mb-8 lg:-mb-10 w-full overflow-hidden">
              <img 
                src="/assets/auth_signup_fullhd.png?v=2" 
                alt="Join Our Community" 
                className="w-full max-w-[560px] lg:max-w-[620px] h-auto object-contain object-bottom rounded-2xl shadow-sm"
              />
            </div>

          </div>

          {/* Right Side: Clean White Form Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-2xl p-7 sm:p-9 transition-all">
              
              {/* Form Title */}
              <div className="mb-5 text-center">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Create Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Join Presentation Evaluator and start your learning journey
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      autoComplete="off"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Checklist */}
                <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 space-y-1.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password Security Rules:
                  </p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-3.5 text-center text-slate-400 shrink-0">•</span>}
                      <span>At least 8 chars</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-3.5 text-center text-slate-400 shrink-0">•</span>}
                      <span>Uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-3.5 text-center text-slate-400 shrink-0">•</span>}
                      <span>Lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-3.5 text-center text-slate-400 shrink-0">•</span>}
                      <span>Number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 col-span-2 ${hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-3.5 text-center text-slate-400 shrink-0">•</span>}
                      <span>Special char (@, $, !, %, &, #, etc.)</span>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    className={`mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center transition-colors ${
                      agreeTerms 
                        ? 'bg-[#059669] text-white' 
                        : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {agreeTerms && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span 
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-snug cursor-pointer select-none"
                  >
                    I agree to the <span className="text-[#059669] dark:text-emerald-400 font-semibold hover:underline">Terms of Service</span> and <span className="text-[#059669] dark:text-emerald-400 font-semibold hover:underline">Privacy Policy</span>
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid || password !== confirmPassword}
                  className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] text-white font-bold text-sm shadow-md shadow-[#059669]/20 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-60 cursor-pointer"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Switch to Login */}
                <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentView('login')}
                    className="text-[#059669] dark:text-emerald-400 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

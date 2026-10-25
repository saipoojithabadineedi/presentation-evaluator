import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, AlertCircle, BarChart2, Target, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppView } from '../../types';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginFormProps {
  setCurrentView: (view: AppView) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ setCurrentView }) => {
  const { login, registeredUsers } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(() => {
    const remembered = localStorage.getItem('pe_remembered_credentials') || localStorage.getItem('pe_last_login_credential');
    if (remembered) return remembered;
    if (registeredUsers && registeredUsers.length > 0) {
      return registeredUsers[0].email || '';
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(() => {
    const regMsg = localStorage.getItem('pe_reg_success_msg');
    if (regMsg) {
      localStorage.removeItem('pe_reg_success_msg');
      return regMsg;
    }
    return '';
  });
  const [errorMessage, setErrorMessage] = useState('');

  // Password Security Rules Evaluation for Sign In
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  // Auto-focus and select remembered email if present
  useEffect(() => {
    if (email && emailInputRef.current) {
      emailInputRef.current.focus();
      emailInputRef.current.select();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your Email Address and Password.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Password must satisfy all security rules (at least 8 characters, uppercase, lowercase, number, and special character).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Login failed.');
        return;
      }

      localStorage.setItem('pe_last_login_credential', email.trim());
      if (rememberMe) {
        localStorage.setItem('pe_remembered_credentials', email.trim());
      } else {
        localStorage.removeItem('pe_remembered_credentials');
      }

      setCurrentView('dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSuccess = (resetCredential: string) => {
    setEmail(resetCredential);
    setPassword('');
    setSuccessMessage('Password reset successfully! You can now log in with your new password.');
    setTimeout(() => setSuccessMessage(''), 8000);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#eef4f0] dark:bg-slate-950 transition-colors">
      
      {/* Subscreen Frame (Matches Image Left Card) */}
      <div className="w-full max-w-6xl bg-gradient-to-br from-[#eaf6f0] via-[#f3faf6] to-[#e5f4ec] dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 rounded-[32px] sm:rounded-[40px] border border-emerald-100/80 dark:border-slate-800 shadow-2xl overflow-hidden relative p-6 sm:p-8 lg:p-10">
        
        {/* Decorative Mint Organic Blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#bbf7d0]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#a7f3d0]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Side: Brand Narrative, Features & Presenter Illustration */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            
            {/* Brand Logo */}
            <div className="flex items-center">
              <img 
                src="/assets/auth_logo_light.png" 
                alt="Presentation Evaluator - Analyze. Improve. Succeed." 
                className="h-11 sm:h-13 w-auto object-contain"
              />
            </div>

            {/* Headline & Description */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Transform Your <br />
                <span className="text-[#059669] dark:text-emerald-400">Presentations</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
                Get AI-powered feedback on your presentation skills, improve your communication, and present with confidence.
              </p>
            </div>

            {/* 3 Value Pillars */}
            <div className="space-y-3 max-w-md">
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d1fae5] dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">AI-Powered Analysis</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Detailed feedback on content, delivery and more</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d1fae5] dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Track Your Progress</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">See improvement over time</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d1fae5] dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Present with Confidence</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Become a better communicator</p>
                </div>
              </div>

            </div>

            {/* Presenter Illustration (User Full HD Artwork) */}
            <div className="hidden sm:flex items-center justify-start pt-2 -mb-6 sm:-mb-8 lg:-mb-10 w-full overflow-hidden">
              <img 
                src="/assets/auth_login_fullhd.png?v=2" 
                alt="Transform Your Presentations" 
                className="w-full max-w-[560px] lg:max-w-[620px] h-auto object-contain object-bottom rounded-2xl shadow-sm"
              />
            </div>

          </div>

          {/* Right Side: Clean White Form Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-xl p-7 sm:p-9 transition-all">
              
              {/* Form Title */}
              <div className="mb-5 text-center">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
                  {successMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                
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
                      ref={emailInputRef}
                      type="email"
                      required
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all placeholder:text-slate-400"
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
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Security Rules Dynamic Checklist */}
                  <div className={`mt-2 p-3 rounded-xl border transition-all ${
                    password.length > 0
                      ? isPasswordValid
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-700/80'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Password Security Rules:
                      </p>
                      {password.length > 0 && isPasswordValid && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> All rules satisfied
                        </span>
                      )}
                    </div>
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
                </div>

                {/* Remember me & Forgot Password */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                        rememberMe 
                          ? 'bg-[#059669] text-white' 
                          : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs font-bold text-[#059669] dark:text-emerald-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] text-white font-bold text-sm shadow-md shadow-[#059669]/20 flex items-center justify-center gap-2 transition-all mt-3 disabled:opacity-60 cursor-pointer"
                >
                  <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Switch to Register */}
                <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentView('register')}
                    className="text-[#059669] dark:text-emerald-400 font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onSuccess={handleForgotPasswordSuccess}
      />
    </div>
  );
};

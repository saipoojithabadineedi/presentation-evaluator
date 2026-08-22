import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppView } from '../../types';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginFormProps {
  setCurrentView: (view: AppView) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ setCurrentView }) => {
  const { login } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [emailOrPhone, setEmailOrPhone] = useState(() => {
    return localStorage.getItem('pe_remembered_credentials') || localStorage.getItem('pe_last_login_credential') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(() => {
    const regMsg = localStorage.getItem('pe_reg_success_msg');
    if (regMsg) {
      localStorage.removeItem('pe_reg_success_msg');
      return regMsg;
    }
    return '';
  });
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-focus and select remembered email/phone if present
  useEffect(() => {
    if (emailOrPhone && emailInputRef.current) {
      emailInputRef.current.focus();
      emailInputRef.current.select();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrPhone.trim() || !password.trim()) {
      setErrorMessage('Please enter your Email/Phone and Password.');
      return;
    }

    const res = login(emailOrPhone, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Login failed.');
      return;
    }

    localStorage.setItem('pe_last_login_credential', emailOrPhone.trim());
    if (rememberMe) {
      localStorage.setItem('pe_remembered_credentials', emailOrPhone.trim());
    } else {
      localStorage.removeItem('pe_remembered_credentials');
    }

    setCurrentView('dashboard');
  };

  const handleForgotPasswordSuccess = (resetCredential: string) => {
    setEmailOrPhone(resetCredential);
    setSuccessMessage('Password reset successfully! You can now log in with your new password.');
    setTimeout(() => setSuccessMessage(''), 6000);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-8 sm:p-10 transition-all">
        
        {/* Card Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in to your account
          </p>
        </div>

        {/* Centered Brand Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/logo.jpg" 
            alt="Presentation Evaluator - Analyze. Improve. Succeed." 
            className="h-16 sm:h-20 max-w-full w-auto object-contain logo-blend drop-shadow-sm"
          />
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
            {successMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
          
          {/* Email or Phone Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                ref={emailInputRef}
                type="text"
                required
                autoComplete="off"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Email or Phone number"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
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
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
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

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                rememberMe 
                  ? 'bg-brand-500 text-white' 
                  : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
              }`}
            >
              {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <span 
              onClick={() => setRememberMe(!rememberMe)}
              className="text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none"
            >
              Remember Me
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all mt-2"
          >
            <span>Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Switch to Register */}
          <div className="text-center pt-4 text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setCurrentView('register')}
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              Sign Up
            </button>
          </div>

        </form>
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

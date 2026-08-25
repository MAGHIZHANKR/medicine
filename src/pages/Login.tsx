import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail } from '../utils/validation';
import { Pill, Mail, Lock, LogIn, AlertCircle, ArrowRight, UserCheck, HeartHandshake } from 'lucide-react';

interface LoginProps {
  onNavigate: (tab: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const profile = await login(email, password);
      if (profile.role === 'caregiver') {
        onNavigate('caregiver-dashboard');
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'patient' | 'caregiver') => {
    setError(null);
    setLoading(true);
    try {
      const demoEmail = role === 'patient' ? 'demo.patient@medimate.ai' : 'demo.caregiver@medimate.ai';
      const profile = await login(demoEmail, 'demo1234');
      if (profile.role === 'caregiver') {
        onNavigate('caregiver-dashboard');
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Quick demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !isValidEmail(forgotEmail)) {
      setError('Please enter a valid email to receive reset instructions.');
      return;
    }
    try {
      await resetPassword(forgotEmail);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Could not send reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E2E8E8] shadow-xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0D5A5A] to-[#147A7A] items-center justify-center text-white shadow-md shadow-[#0D5A5A]/20 mb-2">
            <Pill size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A2E2E] font-heading tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm font-semibold text-[#5A6E6E]">
            Sign in to access your medication routine
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-bold text-[#1A2E2E] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A6E6E]">
                <Mail size={18} />
              </div>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#F7F9F9] border border-[#E2E8E8] rounded-xl text-base text-[#1A2E2E] placeholder:text-[#5A6E6E]/60 focus:bg-white focus:border-[#0D5A5A] transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-sm font-bold text-[#1A2E2E]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-bold text-[#0D5A5A] hover:text-[#094242] cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A6E6E]">
                <Lock size={18} />
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#F7F9F9] border border-[#E2E8E8] rounded-xl text-base text-[#1A2E2E] placeholder:text-[#5A6E6E]/60 focus:bg-white focus:border-[#0D5A5A] transition-all font-medium"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] disabled:opacity-50 text-white font-extrabold text-base rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[50px]"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={20} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Quick 1-Click Demo Logins for Hackathon testing */}
        <div className="pt-3 border-t border-[#E2E8E8] space-y-2">
          <p className="text-xs font-bold text-[#5A6E6E] uppercase tracking-wider text-center">
            One-Click Demo Profiles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-patient-btn"
              type="button"
              onClick={() => handleQuickDemo('patient')}
              className="py-2.5 px-3 bg-[#E0F2F1] hover:bg-[#D1EAEA] text-[#0D5A5A] border border-[#B2DFDB] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <UserCheck size={16} className="text-[#0D5A5A]" />
              <span>Demo Patient</span>
            </button>

            <button
              id="demo-caregiver-btn"
              type="button"
              onClick={() => handleQuickDemo('caregiver')}
              className="py-2.5 px-3 bg-[#F3E8FF] hover:bg-[#E9D5FF] text-purple-900 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <HeartHandshake size={16} className="text-purple-700" />
              <span>Demo Caregiver</span>
            </button>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="text-center pt-2">
          <p className="text-sm font-medium text-[#5A6E6E]">
            Don't have an account?{' '}
            <button
              id="goto-register-btn"
              onClick={() => onNavigate('register')}
              className="font-bold text-[#0D5A5A] hover:text-[#094242] cursor-pointer underline-offset-2 hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-[#E2E8E8] shadow-xl">
            <h3 className="text-xl font-bold text-[#1A2E2E] font-heading">Reset Password</h3>
            {resetSent ? (
              <div className="space-y-4">
                <p className="text-sm text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-medium">
                  Password reset email has been sent! Check your inbox.
                </p>
                <button
                  onClick={() => { setShowForgotModal(false); setResetSent(false); }}
                  className="w-full py-2.5 bg-[#0D5A5A] text-white font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-[#5A6E6E]">
                  Enter your email address to receive password reset instructions.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-[#E2E8E8] rounded-xl text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-sm text-[#5A6E6E] font-semibold hover:bg-[#F7F9F9] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-[#0D5A5A] text-white font-bold rounded-xl"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

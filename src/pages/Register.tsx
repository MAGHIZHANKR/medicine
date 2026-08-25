import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { isValidEmail, isValidPassword } from '../utils/validation';
import { Pill, Mail, Lock, User, UserCheck, HeartHandshake, AlertCircle, ArrowRight } from 'lucide-react';

interface RegisterProps {
  onNavigate: (tab: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const passValidation = isValidPassword(password);
    if (!passValidation.valid) {
      setError(passValidation.message || 'Password too short.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const profile = await register(name, email, password, role);
      if (profile.role === 'caregiver') {
        onNavigate('caregiver-dashboard');
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration could not be completed.');
    } finally {
      setLoading(false);
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
            Create Account
          </h1>
          <p className="text-sm font-semibold text-[#5A6E6E]">
            Join MediMate AI for clear, stress-free routines
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role Picker (Patient vs Caregiver) */}
          <div>
            <label className="block text-sm font-bold text-[#1A2E2E] mb-1.5">
              I am registering as a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="role-select-patient"
                onClick={() => setRole('patient')}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  role === 'patient'
                    ? 'border-[#0D5A5A] bg-[#E0F2F1] text-[#0D5A5A] shadow-xs'
                    : 'border-[#E2E8E8] bg-white text-[#5A6E6E] hover:border-[#B2DFDB]'
                }`}
              >
                <UserCheck size={22} className={role === 'patient' ? 'text-[#0D5A5A]' : 'text-[#5A6E6E]'} />
                <span className="font-bold text-sm">Patient / User</span>
                <span className="text-[11px] text-[#5A6E6E]">I take medicines</span>
              </button>

              <button
                type="button"
                id="role-select-caregiver"
                onClick={() => setRole('caregiver')}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  role === 'caregiver'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                    : 'border-[#E2E8E8] bg-white text-[#5A6E6E] hover:border-purple-200'
                }`}
              >
                <HeartHandshake size={22} className={role === 'caregiver' ? 'text-purple-700' : 'text-[#5A6E6E]'} />
                <span className="font-bold text-sm">Caregiver</span>
                <span className="text-[11px] text-[#5A6E6E]">I support a patient</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="register-name" className="block text-sm font-bold text-[#1A2E2E] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A6E6E]">
                <User size={18} />
              </div>
              <input
                id="register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lakshmi Patel"
                className="w-full pl-10 pr-4 py-3 bg-[#F7F9F9] border border-[#E2E8E8] rounded-xl text-base text-[#1A2E2E] placeholder:text-[#5A6E6E]/60 focus:bg-white focus:border-[#0D5A5A] transition-all font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="register-email" className="block text-sm font-bold text-[#1A2E2E] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A6E6E]">
                <Mail size={18} />
              </div>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#F7F9F9] border border-[#E2E8E8] rounded-xl text-base text-[#1A2E2E] placeholder:text-[#5A6E6E]/60 focus:bg-white focus:border-[#0D5A5A] transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="register-password" className="block text-sm font-bold text-[#1A2E2E] mb-1.5">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A6E6E]">
                <Lock size={18} />
              </div>
              <input
                id="register-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#F7F9F9] border border-[#E2E8E8] rounded-xl text-base text-[#1A2E2E] placeholder:text-[#5A6E6E]/60 focus:bg-white focus:border-[#0D5A5A] transition-all font-medium"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="register-confirm-password" className="block text-sm font-bold text-[#1A2E2E] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A6E6E]">
                <Lock size={18} />
              </div>
              <input
                id="register-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#F7F9F9] border border-[#E2E8E8] rounded-xl text-base text-[#1A2E2E] placeholder:text-[#5A6E6E]/60 focus:bg-white focus:border-[#0D5A5A] transition-all font-medium"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] disabled:opacity-50 text-white font-extrabold text-base rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[50px] mt-2"
          >
            {loading ? (
              <span>Creating your account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="text-center pt-2">
          <p className="text-sm font-medium text-[#5A6E6E]">
            Already have an account?{' '}
            <button
              id="goto-login-btn"
              onClick={() => onNavigate('login')}
              className="font-bold text-[#0D5A5A] hover:text-[#094242] cursor-pointer underline-offset-2 hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { Pill, Clock, CheckCircle, LogOut, User, Sparkles, HeartHandshake, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  currentTab?: string;
  onNavigate?: (tab: string) => void;
  onOpenAiModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab = 'landing', onNavigate, onOpenAiModal }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8E8] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          id="nav-brand-logo"
          onClick={() => onNavigate && onNavigate(user ? (user.role === 'caregiver' ? 'caregiver-dashboard' : 'dashboard') : 'landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-11 h-11 rounded-xl bg-[#0D5A5A] flex items-center justify-center text-white shadow-sm shadow-[#0D5A5A]/20 group-hover:scale-105 transition-transform relative">
            <Pill size={22} className="relative z-10" />
            <div className="absolute -bottom-1 -right-1 bg-white text-[#0D5A5A] rounded-full p-0.5 shadow-xs">
              <CheckCircle size={13} strokeWidth={3} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold text-[#1A2E2E] tracking-tight font-heading">
                MediMate <span className="text-[#0D5A5A] font-extrabold">AI</span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#5A6E6E] tracking-wide hidden sm:block">
              Never miss a medicine moment.
            </p>
          </div>
        </div>

        {/* Navigation Links for Public Landing */}
        {!user && (
          <nav className="hidden md:flex items-center gap-8 text-base font-semibold text-[#5A6E6E]">
            <button 
              onClick={() => onNavigate && onNavigate('landing')}
              className="hover:text-[#0D5A5A] transition-colors cursor-pointer"
            >
              Home
            </button>
            <a href="#features" className="hover:text-[#0D5A5A] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#0D5A5A] transition-colors">
              How It Works
            </a>
            <a href="#safety" className="hover:text-[#0D5A5A] transition-colors flex items-center gap-1 text-[#1A2E2E]">
              <ShieldCheck size={18} className="text-[#0D5A5A]" />
              Safety
            </a>
          </nav>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'patient' && onOpenAiModal && (
                <button
                  id="nav-quick-ai-btn"
                  onClick={onOpenAiModal}
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-[#E0F2F1] hover:bg-[#D1EAEA] text-[#0D5A5A] text-sm font-bold rounded-xl border border-[#B2DFDB] shadow-2xs transition-all cursor-pointer min-h-[40px]"
                >
                  <Sparkles size={16} className="text-[#0D5A5A]" />
                  <span>AI Reminder</span>
                </button>
              )}

              <div className="flex items-center gap-2.5 bg-[#F7F9F9] pl-3 pr-2 py-1.5 rounded-full border border-[#E2E8E8] text-[#1A2E2E]">
                <span className="text-sm font-bold text-[#1A2E2E] max-w-[140px] truncate">
                  {user.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#0D5A5A] font-bold capitalize">
                  {user.role}
                </span>
              </div>

              <button
                id="nav-logout-btn"
                onClick={logout}
                title="Log out"
                className="p-2.5 text-[#5A6E6E] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                aria-label="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                id="nav-login-btn"
                onClick={() => onNavigate && onNavigate('login')}
                className="px-4.5 py-2 text-base font-bold text-[#1A2E2E] hover:text-[#0D5A5A] hover:bg-[#F7F9F9] rounded-xl transition-all cursor-pointer min-h-[44px]"
              >
                Login
              </button>
              <button
                id="nav-get-started-btn"
                onClick={() => onNavigate && onNavigate('register')}
                className="px-5 py-2.5 text-base font-bold bg-[#0D5A5A] hover:bg-[#094242] text-white rounded-xl shadow-xs transition-all cursor-pointer min-h-[44px]"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

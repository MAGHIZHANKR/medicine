import React from 'react';
import { 
  Pill, 
  Clock, 
  CheckCircle2, 
  Volume2, 
  HeartHandshake, 
  History, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  CalendarCheck,
  AlertCircle,
  BellRing,
  Check
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

interface LandingProps {
  onNavigate: (tab: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F7F9F9] text-[#1A2E2E] flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E2E8E8] bg-radial-[at_top_right] from-[#E0F2F1]/80 via-[#F7F9F9] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Heading & Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F2F1] text-[#0D5A5A] text-sm font-bold tracking-wide border border-[#B2DFDB]">
                <Pill size={16} className="text-[#0D5A5A]" />
                <span>Made for Elderly Independence & Caregivers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1A2E2E] font-heading leading-[1.15]">
                Never miss a <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D5A5A] to-[#147A7A]">
                  medicine moment.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[#5A6E6E] max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
                Simple reminders, clear tracking, and caregiver support designed to make everyday medication routines easier and stress-free.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="hero-get-started-btn"
                  onClick={() => onNavigate('register')}
                  className="w-full sm:w-auto px-8 py-4 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] text-white text-lg font-extrabold rounded-2xl shadow-md shadow-[#0D5A5A]/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[56px]"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={20} />
                </button>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-[#F7F9F9] border-2 border-[#E2E8E8] text-[#1A2E2E] text-lg font-bold rounded-2xl transition-all flex items-center justify-center min-h-[56px]"
                >
                  See How It Works
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-semibold text-[#5A6E6E]">
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-[#0D5A5A] stroke-[3]" />
                  <span>Voice Alerts Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-[#0D5A5A] stroke-[3]" />
                  <span>Caregiver Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-[#0D5A5A] stroke-[3]" />
                  <span>Large High-Contrast Text</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-xl border-2 border-[#E2E8E8] space-y-5">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E8]">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#0D5A5A]">Today’s Routine</span>
                    <h2 className="text-lg font-bold text-[#1A2E2E]">Lakshmi’s Plan</h2>
                  </div>
                  <span className="px-3 py-1 bg-[#E0F2F1] text-[#0D5A5A] text-xs font-bold rounded-full border border-[#B2DFDB]">
                    Live Demo
                  </span>
                </div>

                {/* NEXT MEDICINE Card */}
                <div className="rounded-2xl bg-[#E0F2F1]/50 border-2 border-[#0D5A5A]/30 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0D5A5A] uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} /> Next Medicine
                    </span>
                    <span className="text-sm font-bold text-[#1A2E2E] bg-white/90 px-2.5 py-0.5 rounded-full border border-[#E2E8E8]">
                      8:00 AM
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-[#1A2E2E] font-heading">Metformin</h3>
                    <p className="text-base font-bold text-[#0D5A5A]">1 tablet • After breakfast</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => onNavigate('register')}
                      className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
                    >
                      <CheckCircle2 size={18} />
                      <span>✓ Taken</span>
                    </button>

                    <button
                      onClick={() => onNavigate('register')}
                      className="py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                    >
                      <Clock size={16} />
                      <span>⏰ Snooze 10m</span>
                    </button>
                  </div>
                </div>

                {/* Small Status Counters */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <div className="bg-[#F7F9F9] border border-[#E2E8E8] rounded-xl p-2.5 text-center">
                    <p className="text-xs text-[#5A6E6E] font-semibold">Scheduled</p>
                    <p className="text-lg font-extrabold text-[#1A2E2E]">4</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-emerald-800 font-semibold">Taken</p>
                    <p className="text-lg font-extrabold text-emerald-900">2</p>
                  </div>
                  <div className="bg-[#E0F2F1] border border-[#B2DFDB] rounded-xl p-2.5 text-center">
                    <p className="text-xs text-[#0D5A5A] font-semibold">Upcoming</p>
                    <p className="text-lg font-extrabold text-[#0D5A5A]">1</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-rose-800 font-semibold">Missed</p>
                    <p className="text-lg font-extrabold text-rose-900">1</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-20 bg-white border-b border-[#E2E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A2E2E] font-heading tracking-tight">
              Everything you need for a simpler routine
            </h2>
            <p className="text-lg text-[#5A6E6E]">
              Thoughtfully engineered with clear visual cues, voice assistance, and instant caregiver peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-7 rounded-2xl bg-[#F7F9F9] border border-[#E2E8E8] hover:border-[#0D5A5A]/50 transition-all space-y-3.5">
              <div className="w-13 h-13 rounded-xl bg-[#E0F2F1] text-[#0D5A5A] flex items-center justify-center">
                <Clock size={26} />
              </div>
              <h3 className="text-xl font-bold text-[#1A2E2E] font-heading">Smart Reminders</h3>
              <p className="text-base text-[#5A6E6E] leading-relaxed">
                Never forget scheduled medicine times with clear prompts, configurable frequencies, and meals sync.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-2xl bg-[#F7F9F9] border border-[#E2E8E8] hover:border-[#0D5A5A]/50 transition-all space-y-3.5">
              <div className="w-13 h-13 rounded-xl bg-[#E0F2F1] text-[#0D5A5A] flex items-center justify-center">
                <Volume2 size={26} />
              </div>
              <h3 className="text-xl font-bold text-[#1A2E2E] font-heading">Voice Alerts</h3>
              <p className="text-base text-[#5A6E6E] leading-relaxed">
                Hear a friendly, spoken reminder read aloud when medicine time arrives so you don't miss a beat.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-2xl bg-[#F7F9F9] border border-[#E2E8E8] hover:border-[#0D5A5A]/50 transition-all space-y-3.5">
              <div className="w-13 h-13 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="text-xl font-bold text-[#1A2E2E] font-heading">Simple Tracking</h3>
              <p className="text-base text-[#5A6E6E] leading-relaxed">
                Mark reminders as Taken, Snooze for 10 minutes, or track Missed items with zero complication.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-7 rounded-2xl bg-[#F7F9F9] border border-[#E2E8E8] hover:border-[#0D5A5A]/50 transition-all space-y-3.5">
              <div className="w-13 h-13 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <HeartHandshake size={26} />
              </div>
              <h3 className="text-xl font-bold text-[#1A2E2E] font-heading">Caregiver Support</h3>
              <p className="text-base text-[#5A6E6E] leading-relaxed">
                Allow a trusted family member or caregiver to securely view reminder acknowledgments in real time.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-7 rounded-2xl bg-[#F7F9F9] border border-[#E2E8E8] hover:border-[#0D5A5A]/50 transition-all space-y-3.5">
              <div className="w-13 h-13 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <History size={26} />
              </div>
              <h3 className="text-xl font-bold text-[#1A2E2E] font-heading">Medicine History</h3>
              <p className="text-base text-[#5A6E6E] leading-relaxed">
                See past reminder activity and your reminder response rates clearly to stay motivated every day.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-7 rounded-2xl bg-[#F7F9F9] border border-[#E2E8E8] hover:border-[#0D5A5A]/50 transition-all space-y-3.5">
              <div className="w-13 h-13 rounded-xl bg-[#E0F2F1] text-[#0D5A5A] flex items-center justify-center">
                <Sparkles size={26} />
              </div>
              <h3 className="text-xl font-bold text-[#1A2E2E] font-heading">AI Quick Setup</h3>
              <p className="text-base text-[#5A6E6E] leading-relaxed">
                Type or speak natural language phrases and let MediMate organize the exact schedule for your review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (SECTION 8) */}
      <section id="how-it-works" className="py-20 bg-[#F7F9F9] border-b border-[#E2E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-sm font-extrabold text-[#0D5A5A] uppercase tracking-wider">Step-By-Step</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A2E2E] font-heading tracking-tight">
              How MediMate AI Works
            </h2>
            <p className="text-lg text-[#5A6E6E]">
              Four easy steps to take the worry out of daily medicine schedules.
            </p>
          </div>

          {/* 4 Steps Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8E8] shadow-xs text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#0D5A5A] text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-[#1A2E2E] font-heading">Add your medicine</h3>
              <p className="text-sm text-[#5A6E6E]">
                Enter your medicine name, dosage, and whether to take it before or after food.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8E8] shadow-xs text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#0D5A5A] text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-[#1A2E2E] font-heading">Set your schedule</h3>
              <p className="text-sm text-[#5A6E6E]">
                Choose the exact reminder times and daily frequencies that match your lifestyle.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8E8] shadow-xs text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#0D5A5A] text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-[#1A2E2E] font-heading">Receive your reminder</h3>
              <p className="text-sm text-[#5A6E6E]">
                Get clear screen alerts and gentle spoken audio when medicine time arrives.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8E8] shadow-xs text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#0D5A5A] text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                4
              </div>
              <h3 className="text-lg font-bold text-[#1A2E2E] font-heading">Track your response</h3>
              <p className="text-sm text-[#5A6E6E]">
                Tap Taken, Snooze for later, and let your caregiver stay updated automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY & COMPLIANCE SECTION (SECTION 9) */}
      <section id="safety" className="py-16 bg-white border-b border-[#E2E8E8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#1A2E2E] text-white p-8 sm:p-12 shadow-xl space-y-6">
            <div className="flex items-center gap-3 text-[#B2DFDB]">
              <ShieldCheck size={32} />
              <span className="text-sm font-extrabold uppercase tracking-widest">Medical Disclaimer</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Built with safety in mind.
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>MediMate does not diagnose diseases.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>MediMate does not prescribe or change dosage.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>MediMate does not verify actual medication intake.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#B2DFDB] font-bold">✓</span>
                <span>MediMate only reminds users and records self-reported responses.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="inline-block px-4 py-1.5 rounded-lg bg-white/10 text-amber-300 font-bold text-sm mb-3">
                Reminder ≠ Medical Advice
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                "MediMate is a reminder and self-reported tracking tool. It does not provide medical advice, verify medication intake, or replace a healthcare professional."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#F7F9F9] py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#5A6E6E]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0D5A5A] flex items-center justify-center text-white font-bold text-xs">
              M
            </div>
            <span className="font-bold text-[#1A2E2E]">MediMate AI</span>
            <span>— "Never miss a medicine moment."</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('login')} className="hover:text-[#0D5A5A] font-semibold cursor-pointer">
              Patient Login
            </button>
            <button onClick={() => onNavigate('register')} className="hover:text-[#0D5A5A] font-semibold cursor-pointer">
              Create Account
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

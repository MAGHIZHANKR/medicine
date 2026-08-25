import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMedicines } from '../hooks/useMedicines';
import { useReminders } from '../hooks/useReminders';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { ReminderModal } from '../components/ReminderModal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatTime12h, getGreeting } from '../utils/dateUtils';
import { 
  Pill, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BellRing, 
  Utensils, 
  Plus, 
  Sparkles, 
  Volume2,
  CalendarCheck,
  RotateCcw
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAiModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenAiModal }) => {
  const { user } = useAuth();
  const { medicines, loading: medsLoading, seedDemo } = useMedicines();
  const {
    todayLogs,
    todaySummary,
    nextMedicine,
    activeReminder,
    markTaken,
    snooze,
    markMissed,
    triggerManualReminder,
    dismissModal,
    loading: remindersLoading
  } = useReminders(medicines);

  if (medsLoading || remindersLoading) {
    return <LoadingSpinner message="Loading your daily medicine plan..." />;
  }

  const greeting = getGreeting(user?.name);

  return (
    <div className="space-y-8 pb-16">
      {/* Reminder Pop-up Modal when triggered */}
      <ReminderModal
        log={activeReminder}
        onTaken={markTaken}
        onSnooze={snooze}
        onMissed={markMissed}
        onClose={dismissModal}
        voiceEnabled={user?.settings?.voiceReminders ?? true}
      />

      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A2E2E] tracking-tight font-heading">
            {greeting}
          </h1>
          <p className="text-base sm:text-lg text-[#5A6E6E] font-medium mt-1">
            Here is your medicine plan for today.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="dashboard-ai-btn"
            onClick={onOpenAiModal}
            className="inline-flex items-center gap-2 px-4 py-3 bg-[#E0F2F1] hover:bg-[#D1EAEA] text-[#0D5A5A] text-sm font-extrabold rounded-2xl border border-[#B2DFDB] shadow-2xs transition-all cursor-pointer min-h-[46px]"
          >
            <Sparkles size={18} className="text-[#0D5A5A]" />
            <span>✨ AI Setup</span>
          </button>

          <button
            id="dashboard-add-med-btn"
            onClick={() => onNavigate('add-medicine')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] text-white text-sm font-extrabold rounded-2xl shadow-xs transition-all cursor-pointer min-h-[46px]"
          >
            <Plus size={18} />
            <span>+ Add Medicine</span>
          </button>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          id="stat-today-medicines"
          title="Today's Medicines"
          value={todaySummary.totalScheduled}
          subtitle="Total scheduled doses"
          icon={<Pill size={24} />}
          variant="default"
        />

        <StatCard
          id="stat-taken-medicines"
          title="Taken"
          value={todaySummary.taken}
          subtitle="Acknowledged on time"
          icon={<CheckCircle2 size={24} />}
          variant="emerald"
        />

        <StatCard
          id="stat-upcoming-medicines"
          title="Upcoming"
          value={todaySummary.upcoming + todaySummary.snoozed}
          subtitle="Remaining today"
          icon={<Clock size={24} />}
          variant="sky"
        />

        <StatCard
          id="stat-missed-medicines"
          title="Missed"
          value={todaySummary.missed}
          subtitle="Past grace period"
          icon={<AlertCircle size={24} />}
          variant="rose"
        />
      </div>

      {/* NEXT MEDICINE HIGHLIGHT CARD (Natural Tones Deep Teal Hero) */}
      {nextMedicine ? (
        <div className="bg-[#0D5A5A] text-white rounded-[32px] p-6 sm:p-8 shadow-md relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#E0F2F1]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-[#E0F2F1] text-xs font-extrabold uppercase tracking-wider border border-white/20">
                <Clock size={15} />
                <span>Next Scheduled Medicine</span>
              </div>

              <span className="text-xl sm:text-2xl font-extrabold text-[#E0F2F1] font-heading">
                {formatTime12h(nextMedicine.scheduledTime)}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
                {nextMedicine.medicineName}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-lg font-semibold text-white/90">
                <span className="text-white font-bold">{nextMedicine.dosage}</span>
                <span className="text-[#E0F2F1]/60">•</span>
                <span className="flex items-center gap-1.5 text-amber-200">
                  <Utensils size={18} />
                  {nextMedicine.foodInstruction}
                </span>
                {nextMedicine.status === 'snoozed' && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 font-extrabold">
                    Snoozed ({formatTime12h(nextMedicine.snoozeUntil || nextMedicine.scheduledTime)})
                  </span>
                )}
              </div>
            </div>

            {/* Big High-Contrast Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                id="next-med-take-btn"
                onClick={() => markTaken(nextMedicine.id)}
                className="flex-1 py-4 px-6 bg-white hover:bg-slate-100 active:bg-slate-200 text-[#0D5A5A] font-extrabold text-lg rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5 min-h-[56px]"
              >
                <CheckCircle2 size={24} strokeWidth={2.5} className="text-[#0D5A5A]" />
                <span>✓ Take Medicine</span>
              </button>

              <button
                id="next-med-snooze-btn"
                onClick={() => snooze(nextMedicine.id, 10)}
                className="py-4 px-6 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white border border-white/30 backdrop-blur-xs font-bold text-base rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[56px]"
              >
                <Clock size={20} className="text-[#E0F2F1]" />
                <span>⏰ Snooze 10 min</span>
              </button>

              <button
                id="next-med-voice-test-btn"
                onClick={() => triggerManualReminder(nextMedicine)}
                title="Test full voice and screen alert"
                className="py-4 px-4 bg-white/10 hover:bg-white/20 text-[#E0F2F1] border border-white/20 font-bold text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[56px]"
              >
                <Volume2 size={20} />
                <span className="hidden md:inline">Test Alert</span>
              </button>
            </div>
          </div>
        </div>
      ) : medicines.length > 0 ? (
        <div className="bg-[#E0F2F1]/60 border border-[#B2DFDB] rounded-3xl p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-white text-[#0D5A5A] shadow-xs flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-xl font-bold text-[#1A2E2E] font-heading">
            All caught up for right now! 🎉
          </h3>
          <p className="text-sm font-semibold text-[#0D5A5A]">
            You've addressed all scheduled reminders for the day. Great job!
          </p>
        </div>
      ) : null}

      {/* TODAY'S TIMELINE SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1A2E2E] font-heading tracking-tight">
              Today's Plan
            </h2>
            <p className="text-sm font-semibold text-[#5A6E6E]">
              Chronological schedule of your medicine timings
            </p>
          </div>
          
          {medicines.length === 0 && (
            <button
              onClick={seedDemo}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#E0F2F1] text-[#0D5A5A] hover:bg-[#D1EAEA] border border-[#B2DFDB] transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Load Sample Routine</span>
            </button>
          )}
        </div>

        {todayLogs.length > 0 ? (
          <div className="space-y-4">
            {todayLogs.map((log) => {
              const isPending = log.status === 'upcoming' || log.status === 'snoozed';
              return (
                <div
                  key={log.id}
                  id={`timeline-item-${log.id}`}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    log.status === 'taken'
                      ? 'bg-emerald-50/40 border-emerald-200/70'
                      : log.status === 'missed'
                      ? 'bg-rose-50/40 border-rose-200/70'
                      : 'bg-white border-[#E2E8E8] hover:border-[#B2DFDB] shadow-2xs'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Time pill */}
                    <div className="px-3.5 py-2 rounded-xl bg-[#F7F9F9] text-[#1A2E2E] border border-[#E2E8E8] font-extrabold text-sm shrink-0 font-heading text-center">
                      {formatTime12h(log.scheduledTime)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-lg font-bold text-[#1A2E2E] font-heading">
                          {log.medicineName}
                        </h4>
                        <StatusBadge status={log.status} size="sm" />
                      </div>
                      <p className="text-sm font-semibold text-[#5A6E6E] mt-0.5">
                        <span className="text-[#0D5A5A] font-bold">{log.dosage}</span>
                        <span className="mx-1.5">•</span>
                        <span>{log.foodInstruction}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions for this timeline item */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => markTaken(log.id)}
                          className="px-4 py-2 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px]"
                        >
                          <CheckCircle2 size={16} />
                          <span>Taken</span>
                        </button>
                        <button
                          onClick={() => snooze(log.id, 10)}
                          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-sm rounded-xl transition-all cursor-pointer min-h-[40px]"
                        >
                          Snooze
                        </button>
                        <button
                          onClick={() => triggerManualReminder(log)}
                          title="Trigger reminder alert"
                          className="p-2 text-[#5A6E6E] hover:text-[#0D5A5A] hover:bg-[#E0F2F1]/50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Volume2 size={18} />
                        </button>
                      </>
                    ) : log.status === 'taken' ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                        Acknowledged
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1.5 rounded-xl">
                        Missed Window
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No medicine reminders yet"
            description="Add your first medicine reminder or generate one instantly with AI to start your schedule."
            actionText="+ Add Medicine"
            onAction={() => onNavigate('add-medicine')}
          />
        )}
      </div>
    </div>
  );
};

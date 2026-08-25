import React from 'react';
import { MedicineLog } from '../types';
import { formatTime12h } from '../utils/dateUtils';
import { Pill, CheckCircle, Clock, XCircle, Volume2, VolumeX, X, Utensils } from 'lucide-react';
import { playVoiceReminder, stopVoiceReminder } from '../services/notificationService';

interface ReminderModalProps {
  log: MedicineLog | null;
  onTaken: (logId: string) => void;
  onSnooze: (logId: string, minutes?: number) => void;
  onMissed: (logId: string) => void;
  onClose: () => void;
  voiceEnabled?: boolean;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  log,
  onTaken,
  onSnooze,
  onMissed,
  onClose,
  voiceEnabled = true
}) => {
  const [voiceOn, setVoiceOn] = React.useState(voiceEnabled);

  if (!log) return null;

  const handleToggleVoice = () => {
    if (voiceOn) {
      stopVoiceReminder();
      setVoiceOn(false);
    } else {
      setVoiceOn(true);
      playVoiceReminder(log.medicineName, log.dosage, log.foodInstruction);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border-2 border-[#0D5A5A] overflow-hidden relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Dismiss reminder dialog"
        >
          <X size={24} />
        </button>

        {/* Top Header Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0F2F1] text-[#0D5A5A] font-extrabold text-sm uppercase tracking-wider mb-4 animate-bounce">
          <Pill size={18} className="text-[#0D5A5A]" />
          <span>Medicine Time</span>
        </div>

        {/* Medicine Name */}
        <h2 id="reminder-modal-title" className="text-3xl sm:text-4xl font-extrabold text-[#1A2E2E] font-heading tracking-tight mb-2">
          {log.medicineName}
        </h2>

        {/* Dosage & Food instructions */}
        <div className="space-y-1.5 mb-6">
          <p className="text-2xl font-bold text-[#0D5A5A]">
            {log.dosage}
          </p>

          <div className="flex items-center justify-center gap-2 text-[#5A6E6E] text-base font-semibold">
            <Utensils size={18} className="text-amber-700" />
            <span>{log.foodInstruction}</span>
            <span className="text-[#E2E8E8]">•</span>
            <Clock size={18} className="text-[#0D5A5A]" />
            <span>{formatTime12h(log.scheduledTime)}</span>
          </div>
        </div>

        {/* Voice replay / toggle control */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={handleToggleVoice}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#E2E8E8] text-[#5A6E6E] hover:bg-[#F7F9F9] transition-colors cursor-pointer"
          >
            {voiceOn ? (
              <>
                <Volume2 size={16} className="text-[#0D5A5A]" />
                <span>Voice Alert ON (Click to mute)</span>
              </>
            ) : (
              <>
                <VolumeX size={16} className="text-slate-400" />
                <span>Voice Alert MUTED (Click to hear)</span>
              </>
            )}
          </button>
        </div>

        {/* High-Contrast Action Buttons for elderly ergonomics */}
        <div className="space-y-3">
          {/* TAKEN BUTTON */}
          <button
            id="reminder-btn-taken"
            onClick={() => onTaken(log.id)}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] text-white rounded-2xl font-extrabold text-xl shadow-md transition-all cursor-pointer min-h-[58px]"
          >
            <CheckCircle size={26} strokeWidth={2.5} />
            <span>✓ Taken</span>
          </button>

          {/* SNOOZE BUTTON */}
          <button
            id="reminder-btn-snooze"
            onClick={() => onSnooze(log.id, 10)}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 border-2 border-amber-300 rounded-2xl font-bold text-lg transition-all cursor-pointer min-h-[52px]"
          >
            <Clock size={22} className="text-amber-700" />
            <span>⏰ Snooze 10 min</span>
          </button>

          {/* MISSED BUTTON */}
          <button
            id="reminder-btn-missed"
            onClick={() => onMissed(log.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-[#5A6E6E] hover:text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-sm transition-all cursor-pointer"
          >
            <XCircle size={18} />
            <span>Mark as Missed</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Sparkles, X, CheckCircle2, AlertCircle, Loader2, ArrowRight, Pill, Clock, Utensils } from 'lucide-react';
import { parseScheduleWithAI } from '../services/aiService';
import { AIReminderParseResult, Medicine } from '../types';
import { formatTime12h } from '../utils/dateUtils';
import { useMedicines } from '../hooks/useMedicines';
import { useAuth } from '../hooks/useAuth';
import { getTodayDateString } from '../utils/dateUtils';

interface AIScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigate?: () => void;
  onOpenEditForm?: (parsed: AIReminderParseResult) => void;
}

export const AIScheduleModal: React.FC<AIScheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccessNavigate,
  onOpenEditForm
}) => {
  const { user } = useAuth();
  const { addMedicine } = useMedicines();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<AIReminderParseResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setParsedResult(null);

    try {
      const result = await parseScheduleWithAI(prompt);
      setParsedResult(result);
    } catch (err: any) {
      setError(err.message || 'Could not parse reminder. Try entering it in simpler words.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndAdd = async () => {
    if (!user || !parsedResult) return;
    setSaving(true);
    try {
      await addMedicine({
        userId: user.uid,
        name: parsedResult.name,
        dosage: parsedResult.dosage,
        time: parsedResult.time,
        frequency: parsedResult.frequency,
        foodInstruction: parsedResult.foodInstruction,
        startDate: getTodayDateString(),
        notes: parsedResult.notes
      });
      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
        setParsedResult(null);
        setPrompt('');
        onClose();
        if (onSuccessNavigate) onSuccessNavigate();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save reminder');
    } finally {
      setSaving(false);
    }
  };

  const handleManualReview = () => {
    if (parsedResult && onOpenEditForm) {
      onOpenEditForm(parsedResult);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-[#E2E8E8] overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close AI Schedule Setup"
        >
          <X size={22} />
        </button>

        <div className="flex items-center gap-2.5 text-[#1A2E2E] font-extrabold text-xl font-heading mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#E0F2F1] text-[#0D5A5A] flex items-center justify-center">
            <Sparkles size={22} />
          </div>
          <span id="ai-modal-title">AI Schedule Assistant</span>
        </div>

        <p className="text-sm font-semibold text-[#5A6E6E] mb-6">
          Describe your medicine timing in plain language, and MediMate will parse it into a clear schedule.
        </p>

        {/* Input Form */}
        <form onSubmit={handleParse} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#1A2E2E] mb-1.5">
              What medicine should we schedule?
            </label>
            <textarea
              rows={3}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Remind me to take Metformin 500mg after breakfast at 8:00 AM daily."
              className="w-full p-3.5 bg-[#F7F9F9] border border-[#E2E8E8] rounded-2xl text-base text-[#1A2E2E] placeholder:text-slate-400 focus:bg-white focus:border-[#0D5A5A] transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full py-3.5 px-4 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Analyzing routine...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Parse Reminder</span>
              </>
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Parsed Result Preview */}
        {parsedResult && (
          <div className="mt-6 p-5 rounded-2xl bg-[#E0F2F1]/70 border-2 border-[#B2DFDB] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-[#0D5A5A] tracking-wider">
                Extracted Schedule
              </span>
              <span className="text-xs font-bold text-[#0D5A5A] bg-[#B2DFDB]/70 px-2 py-0.5 rounded-full">
                Review Details
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-extrabold text-[#1A2E2E] font-heading">
                {parsedResult.name}
              </h3>
              <p className="text-base font-bold text-[#0D5A5A]">
                {parsedResult.dosage} • {parsedResult.frequency}
              </p>
              <div className="flex items-center gap-3 text-sm text-[#5A6E6E] font-semibold pt-1">
                <span className="flex items-center gap-1">
                  <Clock size={16} className="text-[#0D5A5A]" />
                  {formatTime12h(parsedResult.time)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Utensils size={16} className="text-amber-700" />
                  {parsedResult.foodInstruction}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleConfirmAndAdd}
                disabled={saving}
                className="flex-1 py-3 px-4 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] text-white font-extrabold text-sm rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Added to Schedule!</span>
                  </>
                ) : saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Confirm & Add</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleManualReview}
                className="py-3 px-4 bg-white hover:bg-[#F7F9F9] border border-[#B2DFDB] text-[#0D5A5A] font-bold text-sm rounded-xl cursor-pointer min-h-[44px]"
              >
                Edit Details First
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

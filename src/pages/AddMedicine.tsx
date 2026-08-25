import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMedicines } from '../hooks/useMedicines';
import { Medicine, FrequencyType, FoodInstructionType, AIReminderParseResult } from '../types';
import { validateMedicineForm, MedicineFormErrors } from '../utils/validation';
import { parseScheduleWithAI } from '../services/aiService';
import { getTodayDateString } from '../utils/dateUtils';
import { 
  Pill, 
  Clock, 
  Utensils, 
  Calendar, 
  Sparkles, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileText
} from 'lucide-react';

interface AddMedicineProps {
  initialMedicine?: Medicine | null;
  onNavigate: (tab: string) => void;
  onSuccess?: () => void;
}

export const AddMedicine: React.FC<AddMedicineProps> = ({
  initialMedicine,
  onNavigate,
  onSuccess
}) => {
  const { user } = useAuth();
  const { addMedicine, editMedicine } = useMedicines();

  const isEditing = Boolean(initialMedicine);
  const today = getTodayDateString();

  // Form State
  const [name, setName] = useState(initialMedicine?.name || '');
  const [dosage, setDosage] = useState(initialMedicine?.dosage || '1 tablet');
  const [time, setTime] = useState(initialMedicine?.time || '08:00');
  const [frequency, setFrequency] = useState<FrequencyType>(initialMedicine?.frequency || 'Daily');
  const [foodInstruction, setFoodInstruction] = useState<FoodInstructionType>(
    initialMedicine?.foodInstruction || 'After food'
  );
  const [startDate, setStartDate] = useState(initialMedicine?.startDate || today);
  const [endDate, setEndDate] = useState(initialMedicine?.endDate || '');
  const [notes, setNotes] = useState(initialMedicine?.notes || '');

  // AI assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Form handling state
  const [errors, setErrors] = useState<MedicineFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialMedicine) {
      setName(initialMedicine.name);
      setDosage(initialMedicine.dosage);
      setTime(initialMedicine.time);
      setFrequency(initialMedicine.frequency);
      setFoodInstruction(initialMedicine.foodInstruction);
      setStartDate(initialMedicine.startDate);
      setEndDate(initialMedicine.endDate || '');
      setNotes(initialMedicine.notes || '');
    }
  }, [initialMedicine]);

  const handleAiParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiSuccessMessage(null);

    try {
      const result: AIReminderParseResult = await parseScheduleWithAI(aiPrompt);
      setName(result.name);
      setDosage(result.dosage);
      setTime(result.time);
      setFrequency(result.frequency);
      setFoodInstruction(result.foodInstruction);
      if (result.notes) {
        setNotes(result.notes);
      }
      setAiSuccessMessage('Parsed successfully! Please review all details below before saving.');
    } catch (err: any) {
      setAiError(err.message || "I couldn't understand the schedule clearly. Please enter it manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const validation = validateMedicineForm({
      name,
      dosage,
      time,
      startDate,
      endDate: endDate || undefined
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      if (isEditing && initialMedicine) {
        await editMedicine(initialMedicine.id, {
          name: name.trim(),
          dosage: dosage.trim(),
          time,
          frequency,
          foodInstruction,
          startDate,
          endDate: endDate ? endDate : undefined,
          notes: notes.trim()
        });
        setToastMessage('Medicine reminder updated successfully.');
      } else {
        await addMedicine({
          userId: user.uid,
          name: name.trim(),
          dosage: dosage.trim(),
          time,
          frequency,
          foodInstruction,
          startDate,
          endDate: endDate ? endDate : undefined,
          notes: notes.trim()
        });
        setToastMessage('Medicine reminder added successfully.');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onNavigate('medicines');
      }, 900);
    } catch (err: any) {
      setErrors({ name: err.message || 'Failed to save medicine' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 size={24} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('medicines')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-base cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span>Back to Medicines</span>
        </button>
      </div>

      {/* AI SMART SCHEDULE PARSER */}
      {!isEditing && (
        <div className="bg-[#E0F2F1]/50 rounded-3xl p-6 sm:p-8 border-2 border-[#B2DFDB] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#0D5A5A] font-extrabold text-lg font-heading">
            <Sparkles size={22} className="text-[#0D5A5A]" />
            <span>✨ Create Reminder with AI</span>
          </div>

          <p className="text-sm font-semibold text-[#5A6E6E]">
            Type your reminder schedule in everyday words, for example: <br />
            <em className="text-[#0D5A5A] font-bold not-italic">
              "Remind me to take my BP tablet every morning after breakfast at 8."
            </em>
          </p>

          <form onSubmit={handleAiParse} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your medicine name, time, and routine..."
                className="flex-1 px-4 py-3.5 bg-white border border-[#B2DFDB] rounded-2xl text-base text-[#1A2E2E] placeholder:text-slate-400 focus:border-[#0D5A5A] shadow-2xs font-medium"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiPrompt.trim()}
                className="px-6 py-3.5 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] disabled:opacity-50 text-white font-extrabold text-base rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 min-h-[48px]"
              >
                {aiLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Fill with AI</span>
                  </>
                )}
              </button>
            </div>

            {aiSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-[#E0F2F1] text-[#0D5A5A] text-sm font-bold flex items-center gap-2 border border-[#B2DFDB]">
                <CheckCircle2 size={18} className="text-[#0D5A5A] shrink-0" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            {aiError && (
              <div className="p-3.5 rounded-xl bg-rose-50 text-rose-900 text-sm font-semibold flex items-center gap-2 border border-rose-200">
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* MAIN MEDICINE FORM */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8E8] shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E2E] font-heading tracking-tight">
            {isEditing ? 'Edit Medicine Reminder' : 'Medicine Details'}
          </h1>
          <p className="text-sm font-semibold text-[#5A6E6E] mt-1">
            {isEditing
              ? 'Update the timing or dosage instructions for this medicine'
              : 'Review and confirm your medicine schedule before saving'}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Medicine Name */}
          <div>
            <label htmlFor="med-name" className="block text-base font-bold text-[#1A2E2E] mb-1.5">
              Medicine Name *
            </label>
            <input
              id="med-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Metformin, BP Tablet, Vitamin D"
              className={`w-full px-4 py-3.5 rounded-2xl border text-base text-[#1A2E2E] font-medium ${
                errors.name ? 'border-rose-500 bg-rose-50/40' : 'border-[#E2E8E8] bg-[#F7F9F9] focus:bg-white focus:border-[#0D5A5A]'
              }`}
            />
            {errors.name && <p className="text-xs font-bold text-rose-600 mt-1.5">{errors.name}</p>}
          </div>

          {/* Dosage & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-dosage" className="block text-base font-bold text-[#1A2E2E] mb-1.5">
                Dosage *
              </label>
              <input
                id="med-dosage"
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 tablet, 500mg, 1 capsule"
                className={`w-full px-4 py-3.5 rounded-2xl border text-base text-[#1A2E2E] font-medium ${
                  errors.dosage ? 'border-rose-500 bg-rose-50/40' : 'border-[#E2E8E8] bg-[#F7F9F9] focus:bg-white focus:border-[#0D5A5A]'
                }`}
              />
              {errors.dosage && <p className="text-xs font-bold text-rose-600 mt-1.5">{errors.dosage}</p>}
            </div>

            <div>
              <label htmlFor="med-time" className="block text-base font-bold text-[#1A2E2E] mb-1.5">
                Reminder Time *
              </label>
              <input
                id="med-time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-2xl border text-base text-[#1A2E2E] font-medium ${
                  errors.time ? 'border-rose-500 bg-rose-50/40' : 'border-[#E2E8E8] bg-[#F7F9F9] focus:bg-white focus:border-[#0D5A5A]'
                }`}
              />
              {errors.time && <p className="text-xs font-bold text-rose-600 mt-1.5">{errors.time}</p>}
            </div>
          </div>

          {/* Frequency & Food Instructions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-frequency" className="block text-base font-bold text-[#1A2E2E] mb-1.5">
                Frequency
              </label>
              <select
                id="med-frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E2E8E8] bg-[#F7F9F9] focus:bg-white focus:border-[#0D5A5A] text-base text-[#1A2E2E] font-medium"
              >
                <option value="Daily">Daily (Every day)</option>
                <option value="Twice Daily">Twice Daily (Morning & Evening)</option>
                <option value="Three Times Daily">Three Times Daily</option>
                <option value="Once">Once (Single day)</option>
                <option value="Custom">Custom Schedule</option>
              </select>
            </div>

            <div>
              <label htmlFor="med-food" className="block text-base font-bold text-[#1A2E2E] mb-1.5">
                Food Instruction
              </label>
              <select
                id="med-food"
                value={foodInstruction}
                onChange={(e) => setFoodInstruction(e.target.value as FoodInstructionType)}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E2E8E8] bg-[#F7F9F9] focus:bg-white focus:border-[#0D5A5A] text-base text-[#1A2E2E] font-medium"
              >
                <option value="After food">After food (After meal)</option>
                <option value="Before food">Before food (Empty stomach)</option>
                <option value="With food">With food</option>
                <option value="No instruction">No food instruction</option>
              </select>
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-start-date" className="block text-base font-bold text-[#1A2E2E] mb-1.5">
                Start Date *
              </label>
              <input
                id="med-start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E2E8E8] bg-[#F7F9F9] focus:bg-white focus:border-[#0D5A5A] text-base text-[#1A2E2E] font-medium"
              />
              {errors.startDate && <p className="text-xs font-bold text-rose-600 mt-1.5">{errors.startDate}</p>}
            </div>

            <div>
              <label htmlFor="med-end-date" className="block text-base font-bold text-[#1A2E2E] mb-1.5">
                End Date (Optional)
              </label>
              <input
                id="med-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E2E8E8] bg-[#F7F9F9] focus:bg-white focus:border-[#0D5A5A] text-base text-[#1A2E2E] font-medium"
              />
              {errors.endDate && <p className="text-xs font-bold text-rose-600 mt-1.5">{errors.endDate}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="med-notes" className="block text-base font-bold text-[#1A2E2E] mb-1.5">
              Personal Notes / Doctor's Note (Optional)
            </label>
            <textarea
              id="med-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Take with a full glass of water. Keep in cool place."
              className="w-full px-4 py-3 rounded-2xl border border-[#E2E8E8] bg-[#F7F9F9] focus:bg-white focus:border-[#0D5A5A] text-base text-[#1A2E2E] font-medium"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              id="save-medicine-btn"
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto flex-1 py-4 px-8 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] text-white font-extrabold text-lg rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[56px]"
            >
              {saving ? (
                <span>Saving Reminder...</span>
              ) : (
                <>
                  <Save size={22} />
                  <span>{isEditing ? 'Update Medicine' : 'Save Medicine'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('medicines')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-[#E2E8E8] text-[#1A2E2E] font-bold hover:bg-[#F7F9F9] transition-colors min-h-[56px] cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

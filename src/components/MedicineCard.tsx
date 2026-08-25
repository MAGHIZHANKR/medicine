import React from 'react';
import { Medicine } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatTime12h } from '../utils/dateUtils';
import { Pill, Clock, Utensils, Calendar, Edit3, Trash2, PauseCircle, PlayCircle, FileText } from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
  onTogglePause: (id: string, currentActive: boolean) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onEdit,
  onDelete,
  onTogglePause
}) => {
  return (
    <div
      id={`medicine-card-${medicine.id}`}
      className={`rounded-2xl border transition-all p-5 shadow-xs ${
        medicine.active
          ? 'bg-white border-[#E2E8E8] hover:border-[#B2DFDB]'
          : 'bg-[#F7F9F9] border-[#E2E8E8] opacity-80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              medicine.active
                ? 'bg-[#E0F2F1] text-[#0D5A5A] border border-[#B2DFDB]'
                : 'bg-slate-200 text-slate-500'
            }`}
            aria-hidden="true"
          >
            <Pill size={24} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-[#1A2E2E] tracking-tight font-heading">
                {medicine.name}
              </h3>
              <StatusBadge status={medicine.active ? 'active' : 'paused'} size="sm" />
            </div>

            <p className="text-base font-semibold text-[#0D5A5A] mt-0.5">
              {medicine.dosage}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id={`med-toggle-pause-${medicine.id}`}
            onClick={() => onTogglePause(medicine.id, medicine.active)}
            title={medicine.active ? 'Pause reminders' : 'Resume reminders'}
            className="p-2 text-[#5A6E6E] hover:text-[#1A2E2E] hover:bg-[#F7F9F9] rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label={medicine.active ? 'Pause reminders' : 'Resume reminders'}
          >
            {medicine.active ? <PauseCircle size={20} /> : <PlayCircle size={20} className="text-[#0D5A5A]" />}
          </button>

          <button
            id={`med-edit-btn-${medicine.id}`}
            onClick={() => onEdit(medicine)}
            title="Edit medicine"
            className="p-2 text-[#5A6E6E] hover:text-[#0D5A5A] hover:bg-[#E0F2F1]/50 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label={`Edit ${medicine.name}`}
          >
            <Edit3 size={19} />
          </button>

          <button
            id={`med-delete-btn-${medicine.id}`}
            onClick={() => onDelete(medicine.id)}
            title="Delete reminder"
            className="p-2 text-[#5A6E6E] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label={`Delete ${medicine.name}`}
          >
            <Trash2 size={19} />
          </button>
        </div>
      </div>

      {/* Meta Details Grid */}
      <div className="mt-4 pt-4 border-t border-[#E2E8E8] grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-[#5A6E6E]">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#0D5A5A] shrink-0" />
          <span>
            <strong className="text-[#1A2E2E]">Time:</strong> {formatTime12h(medicine.time)} ({medicine.frequency})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Utensils size={16} className="text-amber-700 shrink-0" />
          <span>
            <strong className="text-[#1A2E2E]">Food:</strong> {medicine.foodInstruction}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#0D5A5A] shrink-0" />
          <span>
            <strong className="text-[#1A2E2E]">Starts:</strong> {medicine.startDate}
            {medicine.endDate ? ` — Ends: ${medicine.endDate}` : ' (Ongoing)'}
          </span>
        </div>

        {medicine.notes && (
          <div className="flex items-center gap-2 sm:col-span-2 text-[#5A6E6E] italic">
            <FileText size={15} className="shrink-0 text-[#7A8E8E]" />
            <span className="truncate">{medicine.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useMedicines } from '../hooks/useMedicines';
import { MedicineCard } from '../components/MedicineCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Medicine } from '../types';
import { Plus, Sparkles, Pill, Search, RotateCcw } from 'lucide-react';

interface MedicinesProps {
  onNavigate: (tab: string) => void;
  onEditMedicine: (medicine: Medicine) => void;
  onOpenAiModal: () => void;
}

export const Medicines: React.FC<MedicinesProps> = ({
  onNavigate,
  onEditMedicine,
  onOpenAiModal
}) => {
  const { medicines, loading, removeMedicine, togglePause, seedDemo } = useMedicines();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return <LoadingSpinner message="Loading your medicine list..." />;
  }

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.foodInstruction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMeds = filtered.filter(m => m.active);
  const pausedMeds = filtered.filter(m => !m.active);

  const confirmDelete = async () => {
    if (deleteTargetId) {
      await removeMedicine(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Medicine Reminder"
        message="Are you sure you want to delete this medicine reminder? This will remove all future scheduled reminders for this medicine."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A2E2E] font-heading tracking-tight">
            My Medicines
          </h1>
          <p className="text-base text-[#5A6E6E] font-medium mt-1">
            Manage your active medicine list, schedules, and instructions
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="meds-ai-btn"
            onClick={onOpenAiModal}
            className="inline-flex items-center gap-2 px-4 py-3 bg-[#E0F2F1] hover:bg-[#D1EAEA] text-[#0D5A5A] text-sm font-extrabold rounded-2xl border border-[#B2DFDB] shadow-2xs transition-all cursor-pointer min-h-[46px]"
          >
            <Sparkles size={18} className="text-[#0D5A5A]" />
            <span>✨ AI Setup</span>
          </button>

          <button
            id="meds-add-btn"
            onClick={() => onNavigate('add-medicine')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] text-white text-sm font-extrabold rounded-2xl shadow-xs transition-all cursor-pointer min-h-[46px]"
          >
            <Plus size={18} />
            <span>+ Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {medicines.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A8E8E]">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medicines by name, dosage, or instruction..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E2E8E8] rounded-2xl text-base text-[#1A2E2E] placeholder:text-slate-400 shadow-xs focus:border-[#0D5A5A] transition-colors font-medium"
          />
        </div>
      )}

      {/* Medicine Cards List */}
      {filtered.length > 0 ? (
        <div className="space-y-8">
          {/* Active Medicines */}
          {activeMeds.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1A2E2E] font-heading flex items-center gap-2">
                <span>Active Medicines</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E0F2F1] text-[#0D5A5A] font-extrabold">
                  {activeMeds.length}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeMeds.map((med) => (
                  <MedicineCard
                    key={med.id}
                    medicine={med}
                    onEdit={onEditMedicine}
                    onDelete={(id) => setDeleteTargetId(id)}
                    onTogglePause={togglePause}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Paused Medicines */}
          {pausedMeds.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#E2E8E8]">
              <h2 className="text-xl font-bold text-[#5A6E6E] font-heading flex items-center gap-2">
                <span>Paused Medicines</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-extrabold">
                  {pausedMeds.length}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pausedMeds.map((med) => (
                  <MedicineCard
                    key={med.id}
                    medicine={med}
                    onEdit={onEditMedicine}
                    onDelete={(id) => setDeleteTargetId(id)}
                    onTogglePause={togglePause}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : medicines.length > 0 ? (
        <EmptyState
          title="No matching medicines found"
          description={`No results found for "${searchTerm}". Try searching for a different name.`}
          actionText="Clear Search"
          onAction={() => setSearchTerm('')}
        />
      ) : (
        <div className="space-y-4">
          <EmptyState
            title="No medicine reminders yet"
            description="Add your first medicine reminder manually or with AI to begin your medication schedule."
            actionText="+ Add Medicine"
            onAction={() => onNavigate('add-medicine')}
          />

          <div className="text-center">
            <button
              onClick={seedDemo}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#0D5A5A] bg-[#E0F2F1] hover:bg-[#D1EAEA] rounded-xl border border-[#B2DFDB] transition-colors cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Load standard demo medicines (Metformin, Vitamin D, BP Tablet)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { ReactNode } from 'react';
import { Pill, Plus } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div
      id={id || 'empty-state-container'}
      className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl border border-dashed border-slate-300 text-center my-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4" aria-hidden="true">
        {icon || <Pill size={32} />}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2 font-heading">{title}</h3>
      <p className="text-base text-slate-600 max-w-md mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          id="empty-state-action-btn"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-base font-bold rounded-xl shadow-sm transition-all cursor-pointer min-h-[48px]"
        >
          <Plus size={20} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

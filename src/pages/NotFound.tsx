import React from 'react';
import { Pill, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onNavigate: (tab: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
        <Pill size={36} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 font-heading">Page Not Found</h1>
      <p className="text-base text-slate-600 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => onNavigate('dashboard')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-xs hover:bg-teal-700 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};

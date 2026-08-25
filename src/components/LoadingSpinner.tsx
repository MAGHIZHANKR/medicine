import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
  fullScreen = false
}) => {
  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 48
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center" role="status" aria-live="polite">
      <Loader2 size={iconSizes[size]} className="animate-spin text-teal-600 mb-3" />
      <p className="text-base font-semibold text-slate-700">{message}</p>
      <span className="sr-only">Loading content</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-xs z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

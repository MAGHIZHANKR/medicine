import React from 'react';
import { LogStatus } from '../types';
import { CheckCircle2, Clock, BellRing, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: LogStatus | 'active' | 'paused';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'taken':
        return {
          icon: CheckCircle2,
          label: 'Taken',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'upcoming':
        return {
          icon: Clock,
          label: 'Upcoming',
          bg: 'bg-[#E0F2F1] text-[#0D5A5A] border-[#B2DFDB]',
          dot: 'bg-[#0D5A5A]'
        };
      case 'snoozed':
        return {
          icon: BellRing,
          label: 'Snoozed',
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'missed':
        return {
          icon: AlertCircle,
          label: 'Missed',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500'
        };
      case 'active':
        return {
          icon: CheckCircle2,
          label: 'Active',
          bg: 'bg-[#E0F2F1] text-[#0D5A5A] border-[#B2DFDB]',
          dot: 'bg-[#0D5A5A]'
        };
      case 'paused':
        return {
          icon: Clock,
          label: 'Paused',
          bg: 'bg-[#F7F9F9] text-[#5A6E6E] border-[#E2E8E8]',
          dot: 'bg-[#7A8E8E]'
        };
      default:
        return {
          icon: Clock,
          label: status,
          bg: 'bg-[#F7F9F9] text-[#5A6E6E] border-[#E2E8E8]',
          dot: 'bg-[#7A8E8E]'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-3 py-1 text-sm font-semibold gap-1.5',
    lg: 'px-4 py-1.5 text-base font-bold gap-2'
  };

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 18
  };

  return (
    <span
      id={`status-badge-${status}`}
      className={`inline-flex items-center rounded-full border whitespace-nowrap select-none transition-colors ${config.bg} ${sizeClasses[size]} ${className}`}
    >
      <Icon size={iconSizes[size]} className="shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};

import React, { ReactNode } from 'react';

interface StatCardProps {
  id?: string;
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'default' | 'emerald' | 'sky' | 'amber' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  onClick
}) => {
  const getTheme = () => {
    switch (variant) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50/60 border-[#E2E8E8] hover:border-emerald-300',
          iconBg: 'bg-emerald-100 text-emerald-700',
          valColor: 'text-emerald-950',
          titleColor: 'text-emerald-800'
        };
      case 'sky':
        return {
          bg: 'bg-[#E0F2F1]/50 border-[#E2E8E8] hover:border-[#B2DFDB]',
          iconBg: 'bg-[#E0F2F1] text-[#0D5A5A]',
          valColor: 'text-[#0D5A5A]',
          titleColor: 'text-[#0D5A5A]'
        };
      case 'amber':
        return {
          bg: 'bg-amber-50/60 border-[#E2E8E8] hover:border-amber-300',
          iconBg: 'bg-amber-100 text-amber-800',
          valColor: 'text-amber-950',
          titleColor: 'text-amber-800'
        };
      case 'rose':
        return {
          bg: 'bg-rose-50/60 border-[#E2E8E8] hover:border-rose-300',
          iconBg: 'bg-rose-100 text-rose-700',
          valColor: 'text-rose-950',
          titleColor: 'text-rose-800'
        };
      default:
        return {
          bg: 'bg-white border-[#E2E8E8] hover:border-[#B2DFDB]',
          iconBg: 'bg-[#E0F2F1] text-[#0D5A5A]',
          valColor: 'text-[#1A2E2E]',
          titleColor: 'text-[#5A6E6E]'
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      id={id || `stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`rounded-2xl border p-5 transition-all shadow-xs ${theme.bg} ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold tracking-tight ${theme.titleColor}`}>{title}</p>
          <p className={`text-3xl font-extrabold mt-1 tracking-tight ${theme.valColor}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-xl shrink-0 ${theme.iconBg}`} aria-hidden="true">
          {icon}
        </div>
      </div>
    </div>
  );
};

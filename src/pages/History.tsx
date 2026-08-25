import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMedicines } from '../hooks/useMedicines';
import { useReminders } from '../hooks/useReminders';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatTime12h, formatDateDisplay, getTodayDateString } from '../utils/dateUtils';
import { LogStatus } from '../types';
import { 
  History as HistoryIcon, 
  CheckCircle2, 
  AlertCircle, 
  Percent, 
  Clock, 
  Calendar, 
  Filter, 
  Search,
  Pill,
  Utensils
} from 'lucide-react';

interface HistoryProps {
  onNavigate: (tab: string) => void;
}

export const History: React.FC<HistoryProps> = ({ onNavigate }) => {
  const { medicines } = useMedicines();
  const { allLogs, loading } = useReminders(medicines);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = getTodayDateString();

  // Filter logs
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      // Status match
      if (statusFilter !== 'all' && log.status !== statusFilter) {
        return false;
      }

      // Search match
      if (
        searchTerm &&
        !log.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.dosage.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Timeframe match
      if (timeframe === 'today') {
        return log.scheduledTime.startsWith(todayStr);
      } else if (timeframe === '7days') {
        const d = new Date(log.scheduledTime);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        return d >= cutoff;
      } else if (timeframe === '30days') {
        const d = new Date(log.scheduledTime);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        return d >= cutoff;
      }

      return true;
    }).sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime));
  }, [allLogs, statusFilter, timeframe, searchTerm, todayStr]);

  // Response Rate Stats
  const stats = useMemo(() => {
    const total = allLogs.length;
    const taken = allLogs.filter(l => l.status === 'taken').length;
    const missed = allLogs.filter(l => l.status === 'missed').length;
    const snoozed = allLogs.filter(l => l.status === 'snoozed').length;
    const responseRate = total > 0 ? Math.round((taken / total) * 100) : 100;

    return { total, taken, missed, snoozed, responseRate };
  }, [allLogs]);

  if (loading) {
    return <LoadingSpinner message="Loading reminder history logs..." />;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs">
        <h1 className="text-3xl font-extrabold text-[#1A2E2E] font-heading tracking-tight">
          Medicine History
        </h1>
        <p className="text-base text-[#5A6E6E] font-medium mt-1">
          Review past reminders, time acknowledgments, and self-reported response rates
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          id="history-stat-total"
          title="Total Reminders"
          value={stats.total}
          subtitle="All recorded events"
          icon={<HistoryIcon size={24} />}
          variant="default"
        />

        <StatCard
          id="history-stat-taken"
          title="Taken"
          value={stats.taken}
          subtitle="Successfully logged"
          icon={<CheckCircle2 size={24} />}
          variant="emerald"
        />

        <StatCard
          id="history-stat-missed"
          title="Missed"
          value={stats.missed}
          subtitle="Unacknowledged doses"
          icon={<AlertCircle size={24} />}
          variant="rose"
        />

        <StatCard
          id="history-stat-rate"
          title="Response Rate"
          value={`${stats.responseRate}%`}
          subtitle="Overall adherence rate"
          icon={<Percent size={24} />}
          variant={stats.responseRate >= 80 ? 'emerald' : stats.responseRate >= 50 ? 'amber' : 'rose'}
        />
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8E8] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A8E8E]">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by medicine name..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F7F9F9] border border-[#E2E8E8] rounded-xl text-sm text-[#1A2E2E] placeholder:text-slate-400 font-medium focus:border-[#0D5A5A]"
            />
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1.5 bg-[#F7F9F9] p-1 rounded-xl border border-[#E2E8E8]">
            {(['all', 'today', '7days', '30days'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === tf ? 'bg-white text-[#0D5A5A] shadow-2xs font-extrabold' : 'text-[#5A6E6E] hover:text-[#1A2E2E]'
                }`}
              >
                {tf === 'all' ? 'All Time' : tf === 'today' ? 'Today' : tf === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-[#5A6E6E] mr-1 flex items-center gap-1">
            <Filter size={14} /> Status:
          </span>
          {['all', 'taken', 'upcoming', 'snoozed', 'missed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#0D5A5A] text-white shadow-2xs'
                  : 'bg-[#F7F9F9] text-[#5A6E6E] hover:bg-[#E0F2F1] hover:text-[#0D5A5A] border border-[#E2E8E8]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* History Log List */}
      {filteredLogs.length > 0 ? (
        <div className="bg-white rounded-3xl border border-[#E2E8E8] shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-[#5A6E6E]">
              <thead className="bg-[#F7F9F9] text-xs font-extrabold text-[#1A2E2E] uppercase tracking-wider border-b border-[#E2E8E8]">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Medicine</th>
                  <th className="px-6 py-4">Dosage & Food</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Logged Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E8]/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F7F9F9]/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-[#1A2E2E]">{formatDateDisplay(log.scheduledTime)}</div>
                      <div className="text-xs text-[#5A6E6E] font-semibold">{formatTime12h(log.scheduledTime)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-[#1A2E2E] text-base font-heading">{log.medicineName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#0D5A5A]">{log.dosage}</div>
                      <div className="text-xs text-[#5A6E6E]">{log.foodInstruction}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={log.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-xs font-bold text-[#5A6E6E]">
                      {log.takenAt ? (
                        <span className="text-emerald-700">Taken at {formatTime12h(log.takenAt)}</span>
                      ) : log.status === 'snoozed' ? (
                        <span className="text-amber-700">Snoozed ({log.snoozeCount}x)</span>
                      ) : log.status === 'missed' ? (
                        <span className="text-rose-700">Missed</span>
                      ) : (
                        <span className="text-[#0D5A5A]">Scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-[#E2E8E8]/60 p-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5A6E6E]">
                    {formatDateDisplay(log.scheduledTime)} • {formatTime12h(log.scheduledTime)}
                  </span>
                  <StatusBadge status={log.status} size="sm" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#1A2E2E] font-heading">{log.medicineName}</h4>
                  <p className="text-sm font-semibold text-[#0D5A5A]">
                    {log.dosage} • {log.foodInstruction}
                  </p>
                </div>
                {log.takenAt && (
                  <p className="text-xs font-bold text-emerald-700">
                    ✓ Logged at {formatTime12h(log.takenAt)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No history records found"
          description="There are no past reminder logs matching your active filters."
          actionText="Clear Filters"
          onAction={() => {
            setStatusFilter('all');
            setTimeframe('all');
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
};

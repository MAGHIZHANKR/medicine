import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CaregiverConnection, MedicineLog, DaySummary } from '../types';
import { 
  getConnectionsForCaregiver, 
  requestConnectionWithPatientCode, 
  subscribeConnections 
} from '../services/caregiverService';
import { getLogsForUser } from '../firebase/firestore';
import { calculateSummary } from '../services/reminderService';
import { formatTime12h, getTodayDateString, formatDateDisplay } from '../utils/dateUtils';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Percent, 
  Pill, 
  ArrowRight, 
  RefreshCw,
  Search,
  ShieldCheck
} from 'lucide-react';

interface CaregiverDashboardProps {
  onNavigate: (tab: string) => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<CaregiverConnection[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientLogs, setPatientLogs] = useState<Record<string, MedicineLog[]>>({});
  const [loading, setLoading] = useState(true);

  // Connect Patient Form State
  const [patientCode, setPatientCode] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const todayStr = getTodayDateString();

  // Subscribe to caregiver's connections
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubscribe = subscribeConnections(user.uid, 'caregiver', async (conns) => {
      setConnections(conns);
      
      // Load logs for all approved patients
      const approved = conns.filter(c => c.status === 'approved');
      if (approved.length > 0 && !selectedPatientId) {
        setSelectedPatientId(approved[0].patientId);
      }

      const logsMap: Record<string, MedicineLog[]> = {};
      for (const p of approved) {
        const logs = await getLogsForUser(p.patientId);
        logsMap[p.patientId] = logs;
      }
      setPatientLogs(logsMap);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user, selectedPatientId]);

  const handleConnectPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !patientCode.trim()) return;

    setConnecting(true);
    setConnectError(null);
    setConnectSuccess(null);

    try {
      await requestConnectionWithPatientCode(patientCode.trim(), user.uid, user.name);
      setConnectSuccess('Connection request sent! The patient can now approve you from their account.');
      setPatientCode('');
    } catch (err: any) {
      setConnectError(err.message || 'Failed to connect. Please check the code.');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading caregiver dashboard & patient status..." />;
  }

  const approvedConnections = connections.filter(c => c.status === 'approved');
  const pendingConnections = connections.filter(c => c.status === 'pending');

  const activePatient = approvedConnections.find(c => c.patientId === selectedPatientId) || approvedConnections[0];
  const currentLogs = activePatient ? (patientLogs[activePatient.patientId] || []) : [];
  
  const todayPatientLogs = currentLogs
    .filter(l => l.scheduledTime.startsWith(todayStr))
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const summary: DaySummary = calculateSummary(todayPatientLogs);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[#0D5A5A] mb-1">
            <Users size={22} />
            <span className="text-xs font-extrabold uppercase tracking-wider">Caregiver Monitoring Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A2E2E] font-heading tracking-tight">
            Caregiver Dashboard
          </h1>
          <p className="text-base text-[#5A6E6E] font-medium mt-0.5">
            Monitor daily medication compliance and self-reported reminder responses in real time.
          </p>
        </div>

        <button
          id="caregiver-connect-patient-btn"
          onClick={() => setShowConnectModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] text-white text-base font-extrabold rounded-2xl shadow-xs transition-all cursor-pointer min-h-[48px] shrink-0"
        >
          <UserPlus size={20} />
          <span>+ Connect Patient</span>
        </button>
      </div>

      {/* Connect Patient Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-[#E2E8E8] shadow-2xl relative">
            <h2 className="text-2xl font-bold text-[#1A2E2E] font-heading">
              Connect to a Patient
            </h2>
            <p className="text-sm text-[#5A6E6E]">
              Ask your family member or patient for their 7-character code (e.g. <strong className="text-[#0D5A5A]">MED-4821</strong>).
            </p>

            <form onSubmit={handleConnectPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1A2E2E] mb-1.5">
                  Patient Code
                </label>
                <input
                  type="text"
                  required
                  value={patientCode}
                  onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MED-4821"
                  className="w-full px-4 py-3.5 bg-[#F7F9F9] border border-[#E2E8E8] rounded-2xl text-lg font-mono font-bold tracking-wider text-[#1A2E2E] uppercase focus:bg-white focus:border-[#0D5A5A]"
                />
              </div>

              {connectSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  <span>{connectSuccess}</span>
                </div>
              )}

              {connectError && (
                <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 text-sm font-semibold border border-rose-200 flex items-center gap-2">
                  <AlertCircle size={18} className="shrink-0 text-rose-600" />
                  <span>{connectError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConnectModal(false);
                    setConnectError(null);
                    setConnectSuccess(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-[#E2E8E8] text-[#5A6E6E] font-semibold text-sm hover:bg-[#F7F9F9] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={connecting || !patientCode.trim()}
                  className="px-6 py-2.5 bg-[#0D5A5A] hover:bg-[#094242] text-white font-bold text-sm rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  {connecting ? 'Connecting...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PATIENT SELECTOR TABS */}
      {approvedConnections.length > 0 ? (
        <div className="space-y-6">
          {/* Patient Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {approvedConnections.map((conn) => {
              const isSelected = activePatient?.patientId === conn.patientId;
              return (
                <button
                  key={conn.id}
                  onClick={() => setSelectedPatientId(conn.patientId)}
                  className={`px-5 py-3 rounded-2xl font-bold text-base transition-all flex items-center gap-2.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0D5A5A] text-white shadow-sm'
                      : 'bg-white text-[#5A6E6E] border border-[#E2E8E8] hover:bg-[#F7F9F9] hover:text-[#1A2E2E]'
                  }`}
                >
                  <Users size={18} className={isSelected ? 'text-[#B2DFDB]' : 'text-[#0D5A5A]'} />
                  <span>{conn.patientName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 font-extrabold">
                    Live
                  </span>
                </button>
              );
            })}
          </div>

          {/* PATIENT TODAY OVERVIEW */}
          {activePatient && (
            <div className="space-y-6">
              
              {/* Stats Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  title="Scheduled Today"
                  value={summary.totalScheduled}
                  subtitle="Doses planned"
                  icon={<Pill size={24} />}
                  variant="default"
                />

                <StatCard
                  title="Taken by Patient"
                  value={summary.taken}
                  subtitle="Self-reported taken"
                  icon={<CheckCircle2 size={24} />}
                  variant="emerald"
                />

                <StatCard
                  title="Upcoming"
                  value={summary.upcoming + summary.snoozed}
                  subtitle="Remaining today"
                  icon={<Clock size={24} />}
                  variant="sky"
                />

                <StatCard
                  title="Missed"
                  value={summary.missed}
                  subtitle="Unacknowledged"
                  icon={<AlertCircle size={24} />}
                  variant="rose"
                />
              </div>

              {/* Patient's Today Plan Timeline */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A2E2E] font-heading tracking-tight">
                      {activePatient.patientName}'s Schedule Today
                    </h2>
                    <p className="text-sm font-semibold text-[#5A6E6E]">
                      Real-time view of {activePatient.patientName}'s reminders
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#5A6E6E] bg-[#F7F9F9] border border-[#E2E8E8] px-3 py-1.5 rounded-xl">
                    {formatDateDisplay(todayStr)}
                  </span>
                </div>

                {todayPatientLogs.length > 0 ? (
                  <div className="space-y-3">
                    {todayPatientLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          log.status === 'taken'
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : log.status === 'missed'
                            ? 'bg-rose-50/40 border-rose-200'
                            : 'bg-white border-[#E2E8E8]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="px-3.5 py-2 rounded-xl bg-[#F7F9F9] text-[#1A2E2E] font-extrabold text-sm border border-[#E2E8E8]">
                            {formatTime12h(log.scheduledTime)}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-[#1A2E2E] font-heading">
                              {log.medicineName}
                            </h4>
                            <p className="text-sm text-[#5A6E6E] font-semibold">
                              <span className="text-[#0D5A5A] font-bold">{log.dosage}</span>
                              <span className="mx-1.5">•</span>
                              <span>{log.foodInstruction}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <StatusBadge status={log.status} size="md" />
                          {log.takenAt && (
                            <span className="text-xs font-bold text-emerald-800 hidden sm:inline">
                              at {formatTime12h(log.takenAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-[#5A6E6E] py-6 text-center">
                    No medicines scheduled for today for this patient.
                  </p>
                )}
              </div>

            </div>
          )}

        </div>
      ) : (
        <EmptyState
          title="No patients connected yet"
          description="Connect to your patient or loved one using their unique 7-character patient code (e.g. MED-4821)."
          actionText="+ Connect Patient"
          onAction={() => setShowConnectModal(true)}
        />
      )}

      {/* Pending Requests List */}
      {pendingConnections.length > 0 && (
        <div className="bg-[#F7F9F9] p-6 rounded-3xl border border-[#E2E8E8] space-y-3">
          <h3 className="text-base font-bold text-[#1A2E2E] flex items-center gap-2">
            <Clock size={18} className="text-amber-600" />
            <span>Pending Connection Requests ({pendingConnections.length})</span>
          </h3>
          <p className="text-xs text-[#5A6E6E]">
            Waiting for the patient to approve your connection request from their account.
          </p>
          <div className="space-y-2">
            {pendingConnections.map((c) => (
              <div key={c.id} className="p-3 bg-white rounded-xl border border-[#E2E8E8] flex justify-between text-sm">
                <span className="font-semibold text-[#1A2E2E]">{c.patientName}</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Pending Approval
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

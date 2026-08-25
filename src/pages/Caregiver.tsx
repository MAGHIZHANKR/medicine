import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CaregiverConnection } from '../types';
import { 
  getConnectionsForPatient, 
  generateNewConnectionCode, 
  approveConnectionRequest, 
  declineConnectionRequest, 
  removeConnection,
  subscribeConnections
} from '../services/caregiverService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { 
  HeartHandshake, 
  Copy, 
  Check, 
  RefreshCw, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  AlertCircle,
  Users
} from 'lucide-react';

interface CaregiverProps {
  onNavigate: (tab: string) => void;
}

export const Caregiver: React.FC<CaregiverProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<CaregiverConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);

  const connectionCode = user?.connectionCode || 'MED-4821';

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubscribe = subscribeConnections(user.uid, 'patient', (conns) => {
      setConnections(conns);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(connectionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerateCode = async () => {
    if (!user) return;
    setGeneratingCode(true);
    try {
      await generateNewConnectionCode(user.uid);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleApprove = async (connectionId: string) => {
    try {
      await approveConnectionRequest(connectionId);
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  const handleDecline = async (connectionId: string) => {
    try {
      await declineConnectionRequest(connectionId);
    } catch (err) {
      console.error('Failed to decline request:', err);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (disconnectId) {
      await removeConnection(disconnectId);
      setDisconnectId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading caregiver connections..." />;
  }

  const activeConnections = connections.filter(c => c.status === 'approved');
  const pendingRequests = connections.filter(c => c.status === 'pending');

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Confirm Disconnect Dialog */}
      <ConfirmDialog
        isOpen={Boolean(disconnectId)}
        title="Disconnect Caregiver"
        message="Are you sure you want to disconnect this caregiver? They will no longer be able to see your medicine reminder status."
        confirmText="Yes, Disconnect"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setDisconnectId(null)}
      />

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs">
        <div className="flex items-center gap-3 text-[#0D5A5A] mb-2">
          <HeartHandshake size={28} />
          <span className="text-sm font-extrabold uppercase tracking-wider">Family & Caregiver Support</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#1A2E2E] font-heading tracking-tight">
          Caregiver Connections
        </h1>
        <p className="text-base text-[#5A6E6E] font-medium mt-1">
          Share your reminder progress with loved ones or a professional caregiver for extra support.
        </p>
      </div>

      {/* YOUR CONNECTION CODE CARD */}
      <div className="bg-[#E0F2F1]/50 rounded-3xl p-6 sm:p-8 border-2 border-[#B2DFDB] shadow-xs space-y-6">
        <div>
          <span className="text-xs font-extrabold text-[#0D5A5A] uppercase tracking-wider">
            Your Personal Patient Code
          </span>
          <h2 className="text-2xl font-bold text-[#1A2E2E] font-heading mt-1">
            Share this code with your Caregiver
          </h2>
          <p className="text-sm text-[#5A6E6E] mt-1">
            When your caregiver enters this code on their MediMate account, you can approve them to see your daily medicine progress.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Big High-Contrast Code Box */}
          <div className="px-8 py-4 bg-white rounded-2xl border-2 border-[#0D5A5A] shadow-sm flex items-center justify-center min-w-[220px]">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-widest font-mono text-[#0D5A5A] select-all">
              {connectionCode}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="copy-connection-code-btn"
              onClick={handleCopyCode}
              className="px-6 py-4 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] text-white font-extrabold text-base rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-2 min-h-[56px]"
            >
              {copied ? (
                <>
                  <Check size={20} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={20} />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleRegenerateCode}
              disabled={generatingCode}
              title="Generate a fresh code"
              className="p-4 bg-white hover:bg-[#F7F9F9] border border-[#B2DFDB] text-[#0D5A5A] rounded-2xl transition-colors cursor-pointer min-h-[56px]"
              aria-label="Generate new code"
            >
              <RefreshCw size={20} className={generatingCode ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#0D5A5A]">
          <ShieldCheck size={16} className="text-[#0D5A5A]" />
          <span>Caregivers can ONLY view self-reported logs. They cannot alter your medicines without your consent.</span>
        </div>
      </div>

      {/* PENDING APPROVAL REQUESTS */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-lg font-heading">
            <Clock size={22} className="text-amber-700" />
            <span>Pending Caregiver Requests ({pendingRequests.length})</span>
          </div>
          <p className="text-sm font-semibold text-amber-800">
            The following caregivers have entered your code and requested to connect:
          </p>

          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-lg font-bold text-[#1A2E2E] font-heading">
                    {request.caregiverName}
                  </h4>
                  <p className="text-xs text-[#5A6E6E] font-medium">
                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl cursor-pointer transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecline(request.id)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl cursor-pointer transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONNECTED CAREGIVERS LIST */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs space-y-6">
        <h3 className="text-2xl font-bold text-[#1A2E2E] font-heading tracking-tight">
          Connected Caregivers
        </h3>

        {activeConnections.length > 0 ? (
          <div className="space-y-3">
            {activeConnections.map((conn) => (
              <div
                key={conn.id}
                className="p-5 rounded-2xl border border-[#E2E8E8] bg-[#F7F9F9] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#E0F2F1] text-[#0D5A5A] flex items-center justify-center font-bold">
                    <Users size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#1A2E2E] font-heading">
                      {conn.caregiverName}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <UserCheck size={13} />
                      Connected
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setDisconnectId(conn.id)}
                  className="p-2.5 text-[#7A8E8E] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Disconnect caregiver"
                  aria-label={`Disconnect ${conn.caregiverName}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#F7F9F9] rounded-2xl border border-dashed border-[#B2DFDB] space-y-2">
            <HeartHandshake size={32} className="text-[#7A8E8E] mx-auto" />
            <h4 className="text-base font-bold text-[#1A2E2E]">No Caregivers Connected Yet</h4>
            <p className="text-sm text-[#5A6E6E] max-w-sm mx-auto">
              Share your patient code above with a family member so they can view your daily progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

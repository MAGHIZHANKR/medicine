import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { requestNotificationPermission, playVoiceReminder } from '../services/notificationService';
import { 
  User, 
  Bell, 
  Volume2, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  Save, 
  CheckCircle2, 
  Key, 
  HeartHandshake,
  VolumeX,
  Sparkles
} from 'lucide-react';

interface SettingsProps {
  onNavigate: (tab: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { user, updateSettings, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [browserNotifications, setBrowserNotifications] = useState(
    user?.settings?.browserNotifications ?? true
  );
  const [voiceReminders, setVoiceReminders] = useState(
    user?.settings?.voiceReminders ?? true
  );
  const [gracePeriod, setGracePeriod] = useState<number>(
    user?.settings?.gracePeriodMinutes ?? 30
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [voiceTesting, setVoiceTesting] = useState(false);

  const handleToggleNotifications = async (enabled: boolean) => {
    setBrowserNotifications(enabled);
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setBrowserNotifications(false);
      }
    }
  };

  const handleTestVoice = () => {
    setVoiceTesting(true);
    playVoiceReminder('Metformin', '1 tablet', 'after breakfast');
    setTimeout(() => setVoiceTesting(false), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        browserNotifications,
        voiceReminders,
        gracePeriodMinutes: Number(gracePeriod)
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs">
        <h1 className="text-3xl font-extrabold text-[#1A2E2E] font-heading tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-base text-[#5A6E6E] font-medium mt-1">
          Customize notifications, voice alerts, grace periods, and your profile
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* PROFILE SECTION */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-[#1A2E2E] font-bold text-xl font-heading">
            <User size={22} className="text-[#0D5A5A]" />
            <span>Profile Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1A2E2E] mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-4 py-3 bg-[#F7F9F9] border border-[#E2E8E8] rounded-xl text-[#1A2E2E] font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A2E2E] mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-3 bg-[#F7F9F9] border border-[#E2E8E8] rounded-xl text-[#1A2E2E] font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#5A6E6E]">
            <span className="font-bold">Account Role:</span>
            <span className="capitalize px-2.5 py-0.5 rounded-full bg-[#E0F2F1] text-[#0D5A5A] font-extrabold text-xs">
              {user?.role}
            </span>
          </div>
        </div>

        {/* NOTIFICATION PREFERENCES */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-[#1A2E2E] font-bold text-xl font-heading">
            <Bell size={22} className="text-[#0D5A5A]" />
            <span>Reminders & Voice Audio</span>
          </div>

          <div className="space-y-4 divide-y divide-[#E2E8E8]/60">
            {/* Browser Notifications Switch */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-base font-bold text-[#1A2E2E]">Browser Notifications</h4>
                <p className="text-xs text-[#5A6E6E]">
                  Receive visual desktop reminders when medicine time arrives
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={browserNotifications}
                  onChange={(e) => handleToggleNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D5A5A]"></div>
              </label>
            </div>

            {/* Voice Reminders Switch */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <h4 className="text-base font-bold text-[#1A2E2E]">Voice Spoken Reminders</h4>
                <p className="text-xs text-[#5A6E6E]">
                  Read out the medicine name, dosage, and food instruction aloud
                </p>
              </div>
              <div className="flex items-center gap-3">
                {voiceReminders && (
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E0F2F1] text-[#0D5A5A] border border-[#B2DFDB] hover:bg-[#D1EAEA] cursor-pointer transition-colors"
                  >
                    {voiceTesting ? 'Playing sample...' : 'Test Voice'}
                  </button>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceReminders}
                    onChange={(e) => setVoiceReminders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D5A5A]"></div>
                </label>
              </div>
            </div>

            {/* Reminder Grace Period (Section 24) */}
            <div className="pt-4 space-y-2">
              <label className="block text-base font-bold text-[#1A2E2E]">
                Reminder Grace Period
              </label>
              <p className="text-xs text-[#5A6E6E]">
                How long after scheduled time before a reminder is marked as missed:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[10, 20, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setGracePeriod(mins)}
                    className={`py-3 px-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      gracePeriod === mins
                        ? 'border-[#0D5A5A] bg-[#E0F2F1] text-[#0D5A5A] shadow-2xs font-extrabold'
                        : 'border-[#E2E8E8] bg-white text-[#5A6E6E] hover:bg-[#F7F9F9] hover:text-[#1A2E2E]'
                    }`}
                  >
                    {mins} minutes
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CAREGIVER CONNECTION CODE INFO */}
        {user?.role === 'patient' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8E8] shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-[#1A2E2E] font-bold text-xl font-heading">
              <Key size={22} className="text-[#0D5A5A]" />
              <span>Caregiver Access Code</span>
            </div>
            <p className="text-sm text-[#5A6E6E]">
              Your active connection code is <strong className="text-[#0D5A5A] font-mono text-base px-2 py-0.5 bg-[#E0F2F1] rounded-lg">{user?.connectionCode || 'MED-4821'}</strong>.
            </p>
          </div>
        )}

        {/* SAVE BUTTON & LOGOUT */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-4 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] text-white font-extrabold text-base rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[52px]"
          >
            {saving ? (
              <span>Saving Preferences...</span>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 size={20} />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Preferences</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full sm:w-auto px-6 py-4 bg-[#F7F9F9] hover:bg-rose-50 text-[#5A6E6E] hover:text-rose-700 font-bold text-base rounded-2xl border border-[#E2E8E8] transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[52px]"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>

      </form>
    </div>
  );
};

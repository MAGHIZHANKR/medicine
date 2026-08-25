import { useState, useEffect, useCallback, useMemo } from 'react';
import { MedicineLog, Medicine, DaySummary } from '../types';
import { useAuth } from './useAuth';
import { 
  ensureTodayLogs, 
  markMedicineTaken, 
  snoozeMedicine, 
  markMedicineMissed, 
  evaluateMissedReminders, 
  calculateSummary 
} from '../services/reminderService';
import { subscribeToLogsForUser } from '../firebase/firestore';
import { triggerBrowserNotification, playVoiceReminder } from '../services/notificationService';
import { getTodayDateString } from '../utils/dateUtils';
import confetti from 'canvas-confetti';

export function useReminders(medicines: Medicine[]) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<MedicineLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeReminder, setActiveReminder] = useState<MedicineLog | null>(null);
  const [promptedLogIds, setPromptedLogIds] = useState<Set<string>>(new Set());

  const todayStr = getTodayDateString();
  const graceMinutes = user?.settings?.gracePeriodMinutes ?? 30;
  const voiceEnabled = user?.settings?.voiceReminders ?? true;
  const notificationsEnabled = user?.settings?.browserNotifications ?? true;

  // Real-time Firestore logs subscription
  useEffect(() => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToLogsForUser(user.uid, (fetchedLogs) => {
      setLogs(fetchedLogs);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Synchronize today's logs if new medicines added or date changed
  useEffect(() => {
    if (!user || medicines.length === 0) return;

    let mounted = true;
    ensureTodayLogs(medicines, user.uid, logs).then((ensured) => {
      if (mounted && ensured.length !== logs.length) {
        setLogs(ensured);
      }
    });

    return () => {
      mounted = false;
    };
  }, [user, medicines, logs]);

  // Periodic check for upcoming reminder alerts and missed grace period
  useEffect(() => {
    if (!user || logs.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const nowMs = now.getTime();

      // Check for any log whose scheduled / snoozed time has arrived
      const todayLogs = logs.filter(l => l.scheduledTime.startsWith(todayStr));

      for (const log of todayLogs) {
        if (log.status === 'upcoming' || log.status === 'snoozed') {
          const targetTime = log.status === 'snoozed' && log.snoozeUntil ? new Date(log.snoozeUntil).getTime() : new Date(log.scheduledTime).getTime();

          // If within trigger window (now >= targetTime and not yet past grace period)
          if (nowMs >= targetTime && !promptedLogIds.has(log.id)) {
            // Trigger reminder modal & voice & notification
            setActiveReminder(log);
            setPromptedLogIds(prev => new Set(prev).add(log.id));

            if (notificationsEnabled) {
              triggerBrowserNotification(
                '💊 Medicine Time',
                `${log.medicineName} — ${log.dosage} (${log.foodInstruction})`
              );
            }

            if (voiceEnabled) {
              playVoiceReminder(log.medicineName, log.dosage, log.foodInstruction);
            }
            break;
          }
        }
      }

      // Check for missed logs exceeding grace period
      evaluateMissedReminders(todayLogs, graceMinutes).then(updated => {
        // Updated in DB by evaluateMissedReminders
      });
    }, 15000); // check every 15s

    return () => clearInterval(interval);
  }, [logs, promptedLogIds, user, todayStr, graceMinutes, voiceEnabled, notificationsEnabled]);

  const todayLogs = useMemo(() => {
    return logs
      .filter(l => l.scheduledTime.startsWith(todayStr))
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [logs, todayStr]);

  const todaySummary: DaySummary = useMemo(() => {
    return calculateSummary(todayLogs);
  }, [todayLogs]);

  // The next upcoming or currently active medicine
  const nextMedicine = useMemo(() => {
    const pending = todayLogs.filter(l => l.status === 'upcoming' || l.status === 'snoozed');
    if (pending.length === 0) return null;
    return pending[0];
  }, [todayLogs]);

  const markTaken = useCallback(async (logId: string) => {
    try {
      await markMedicineTaken(logId);
      if (activeReminder?.id === logId) {
        setActiveReminder(null);
      }
      // Trigger subtle celebratory confetti
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#0D9488', '#0284C7', '#10B981', '#F59E0B']
        });
      } catch (e) {
        // ignore in non-canvas envs
      }
    } catch (err) {
      console.error('Error marking medicine taken:', err);
    }
  }, [activeReminder]);

  const snooze = useCallback(async (logId: string, minutes: number = 10) => {
    try {
      const log = logs.find(l => l.id === logId);
      const count = log?.snoozeCount || 0;
      await snoozeMedicine(logId, minutes, count);
      if (activeReminder?.id === logId) {
        setActiveReminder(null);
      }
      // Allow re-prompt after snooze
      setPromptedLogIds(prev => {
        const next = new Set(prev);
        next.delete(logId);
        return next;
      });
    } catch (err) {
      console.error('Error snoozing medicine:', err);
    }
  }, [activeReminder, logs]);

  const markMissed = useCallback(async (logId: string) => {
    try {
      await markMedicineMissed(logId);
      if (activeReminder?.id === logId) {
        setActiveReminder(null);
      }
    } catch (err) {
      console.error('Error marking missed:', err);
    }
  }, [activeReminder]);

  const triggerManualReminder = useCallback((log: MedicineLog) => {
    setActiveReminder(log);
    if (voiceEnabled) {
      playVoiceReminder(log.medicineName, log.dosage, log.foodInstruction);
    }
    if (notificationsEnabled) {
      triggerBrowserNotification(
        '💊 Medicine Time',
        `${log.medicineName} — ${log.dosage} (${log.foodInstruction})`
      );
    }
  }, [voiceEnabled, notificationsEnabled]);

  const dismissModal = useCallback(() => {
    setActiveReminder(null);
  }, []);

  return {
    allLogs: logs,
    todayLogs,
    todaySummary,
    nextMedicine,
    loading,
    activeReminder,
    markTaken,
    snooze,
    markMissed,
    triggerManualReminder,
    dismissModal
  };
}

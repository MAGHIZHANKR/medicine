import { Medicine, MedicineLog, DaySummary } from '../types';
import { getTodayDateString, isPastSchedule } from '../utils/dateUtils';
import { saveMedicineLogDoc, updateLogStatus } from '../firebase/firestore';

export async function ensureTodayLogs(
  medicines: Medicine[],
  userId: string,
  existingLogs: MedicineLog[]
): Promise<MedicineLog[]> {
  const todayStr = getTodayDateString();
  const activeMeds = medicines.filter(m => {
    if (!m.active) return false;
    if (m.startDate > todayStr) return false;
    if (m.endDate && m.endDate < todayStr) return false;
    return true;
  });

  const updatedLogs = [...existingLogs];

  for (const med of activeMeds) {
    // A medicine might have multiple times or standard frequency
    const times = getScheduleTimesForFrequency(med.frequency, med.time);

    for (const timeSlot of times) {
      const scheduledIso = `${todayStr}T${timeSlot}:00`;
      const alreadyLogged = updatedLogs.some(
        l => l.medicineId === med.id && l.scheduledTime.startsWith(`${todayStr}T${timeSlot}`)
      );

      if (!alreadyLogged) {
        const newLog: MedicineLog = {
          id: `log_${med.id}_${todayStr}_${timeSlot.replace(':', '')}`,
          medicineId: med.id,
          userId,
          medicineName: med.name,
          dosage: med.dosage,
          foodInstruction: med.foodInstruction,
          scheduledTime: scheduledIso,
          status: 'upcoming',
          createdAt: new Date().toISOString(),
          snoozeCount: 0
        };

        await saveMedicineLogDoc(newLog);
        updatedLogs.push(newLog);
      }
    }
  }

  return updatedLogs;
}

export function getScheduleTimesForFrequency(frequency: string, baseTime: string): string[] {
  const cleanBase = baseTime || '08:00';
  switch (frequency) {
    case 'Twice Daily':
      return [cleanBase, '20:00'];
    case 'Three Times Daily':
      return [cleanBase, '13:00', '20:00'];
    case 'Once':
    case 'Daily':
    case 'Custom':
    default:
      return [cleanBase];
  }
}

export async function markMedicineTaken(logId: string): Promise<void> {
  await updateLogStatus(logId, 'taken', new Date().toISOString());
}

export async function snoozeMedicine(logId: string, minutes: number = 10, currentCount: number = 0): Promise<string> {
  const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  await updateLogStatus(logId, 'snoozed', new Date().toISOString(), snoozeTime);
  return snoozeTime;
}

export async function markMedicineMissed(logId: string): Promise<void> {
  await updateLogStatus(logId, 'missed', new Date().toISOString());
}

export async function evaluateMissedReminders(
  logs: MedicineLog[],
  gracePeriodMinutes: number = 30
): Promise<MedicineLog[]> {
  const updatedLogs = [...logs];
  for (const log of logs) {
    if (log.status === 'upcoming' || log.status === 'snoozed') {
      const referenceTime = log.status === 'snoozed' && log.snoozeUntil ? log.snoozeUntil : log.scheduledTime;
      if (isPastSchedule(referenceTime, gracePeriodMinutes)) {
        await markMedicineMissed(log.id);
        log.status = 'missed';
        log.actionTime = new Date().toISOString();
      }
    }
  }
  return updatedLogs;
}

export function calculateSummary(logs: MedicineLog[]): DaySummary {
  const total = logs.length;
  const taken = logs.filter(l => l.status === 'taken').length;
  const upcoming = logs.filter(l => l.status === 'upcoming').length;
  const snoozed = logs.filter(l => l.status === 'snoozed').length;
  const missed = logs.filter(l => l.status === 'missed').length;

  const respondedCount = taken + snoozed;
  const eligibleCount = taken + snoozed + missed;
  const responseRate = eligibleCount > 0 ? Math.round((respondedCount / eligibleCount) * 100) : 100;

  return {
    totalScheduled: total,
    taken,
    upcoming,
    snoozed,
    missed,
    responseRate
  };
}

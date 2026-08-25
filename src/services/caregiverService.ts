import {
  findPatientByCaregiverCode,
  createCaregiverLinkRequest,
  updateCaregiverLinkStatus,
  subscribeToCaregiverLinksForPatient,
  subscribeToCaregiverLinksForCaregiver,
  getMedicinesForUser,
  getLogsForUser,
  updateUserProfileData
} from '../firebase/firestore';
import { UserProfile, CaregiverLink, CaregiverConnection, Medicine, MedicineLog, DaySummary } from '../types';
import { calculateSummary, ensureTodayLogs } from './reminderService';
import { getTodayDateString } from '../utils/dateUtils';

export async function requestConnectionByCode(
  caregiver: UserProfile,
  code: string
): Promise<{ success: boolean; message: string; link?: CaregiverLink }> {
  if (!code || code.trim().length === 0) {
    return { success: false, message: 'Please enter a caregiver connection code.' };
  }

  const patient = await findPatientByCaregiverCode(code);
  if (!patient) {
    return {
      success: false,
      message: 'No patient found with that code. Please verify the code with your patient (e.g., MED-4821).'
    };
  }

  if (patient.uid === caregiver.uid) {
    return { success: false, message: 'You cannot connect to yourself as a patient.' };
  }

  const link = await createCaregiverLinkRequest(caregiver, patient);
  return {
    success: true,
    message: `Connection request sent to ${patient.name}. Waiting for patient approval.`,
    link
  };
}

export async function requestConnectionWithPatientCode(
  code: string,
  caregiverUid: string,
  caregiverName: string
): Promise<CaregiverLink> {
  const caregiverDummy: UserProfile = {
    uid: caregiverUid,
    name: caregiverName,
    email: '',
    role: 'caregiver',
    createdAt: new Date().toISOString()
  };
  const res = await requestConnectionByCode(caregiverDummy, code);
  if (!res.success || !res.link) {
    throw new Error(res.message);
  }
  return res.link;
}

export async function approveCaregiver(linkId: string): Promise<void> {
  await updateCaregiverLinkStatus(linkId, 'approved');
}

export async function approveConnectionRequest(linkId: string): Promise<void> {
  await approveCaregiver(linkId);
}

export async function declineCaregiver(linkId: string): Promise<void> {
  await updateCaregiverLinkStatus(linkId, 'declined');
}

export async function declineConnectionRequest(linkId: string): Promise<void> {
  await declineCaregiver(linkId);
}

export async function removeConnection(linkId: string): Promise<void> {
  await updateCaregiverLinkStatus(linkId, 'declined');
}

export function subscribeConnections(
  userId: string,
  role: 'patient' | 'caregiver',
  callback: (links: CaregiverConnection[]) => void
): () => void {
  if (role === 'patient') {
    return subscribeToCaregiverLinksForPatient(userId, callback);
  } else {
    return subscribeToCaregiverLinksForCaregiver(userId, callback);
  }
}

export function subscribeCaregiverRequests(patientId: string, callback: (links: CaregiverLink[]) => void): () => void {
  return subscribeToCaregiverLinksForPatient(patientId, callback);
}

export function subscribeMyPatients(caregiverId: string, callback: (links: CaregiverLink[]) => void): () => void {
  return subscribeToCaregiverLinksForCaregiver(caregiverId, callback);
}

export async function getConnectionsForPatient(patientId: string): Promise<CaregiverConnection[]> {
  return new Promise((resolve) => {
    const unsub = subscribeToCaregiverLinksForPatient(patientId, (links) => {
      unsub();
      resolve(links);
    });
  });
}

export async function getConnectionsForCaregiver(caregiverId: string): Promise<CaregiverConnection[]> {
  return new Promise((resolve) => {
    const unsub = subscribeToCaregiverLinksForCaregiver(caregiverId, (links) => {
      unsub();
      resolve(links);
    });
  });
}

export async function generateNewConnectionCode(userId: string): Promise<string> {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newCode = `MED-${randomNum}`;
  await updateUserProfileData(userId, { connectionCode: newCode });
  return newCode;
}

export interface PatientDetailedStatus {
  patient: {
    uid: string;
    name: string;
    email: string;
  };
  todayMedicines: Medicine[];
  todayLogs: MedicineLog[];
  summary: DaySummary;
}

export async function getPatientTodayOverview(patientId: string, patientName: string, patientEmail: string): Promise<PatientDetailedStatus> {
  const medicines = await getMedicinesForUser(patientId);
  const rawLogs = await getLogsForUser(patientId);
  const todayStr = getTodayDateString();

  const initializedLogs = await ensureTodayLogs(medicines, patientId, rawLogs);
  const todayLogs = initializedLogs.filter(l => l.scheduledTime.startsWith(todayStr));
  const summary = calculateSummary(todayLogs);

  return {
    patient: {
      uid: patientId,
      name: patientName,
      email: patientEmail
    },
    todayMedicines: medicines.filter(m => m.active),
    todayLogs,
    summary
  };
}

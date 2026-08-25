import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import {
  UserProfile,
  Medicine,
  MedicineLog,
  CaregiverLink,
  CaregiverLinkStatus,
  LogStatus
} from '../types';

// Local storage keys for resilient fallback / demo execution
const LS_USERS = 'medimate_db_users';
const LS_MEDICINES = 'medimate_db_medicines';
const LS_LOGS = 'medimate_db_logs';
const LS_LINKS = 'medimate_db_links';

// Custom event emitter for reactive local mode
const LOCAL_EVENT_NAME = 'medimate_db_change';
function notifyLocalChange(collectionName: string) {
  window.dispatchEvent(new CustomEvent(LOCAL_EVENT_NAME, { detail: { collectionName } }));
}

// -------------------------------------------------------------
// USER PROFILE OPERATIONS
// -------------------------------------------------------------

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, profile, { merge: true });
    } catch (error) {
      console.error('Firestore saveUserProfile error:', error);
    }
  }
  // Also keep local sync
  const users: Record<string, UserProfile> = JSON.parse(localStorage.getItem(LS_USERS) || '{}');
  users[profile.uid] = profile;
  localStorage.setItem(LS_USERS, JSON.stringify(users));
  notifyLocalChange('users');
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
    } catch (error) {
      console.warn('Firestore getUserProfile failed, checking local:', error);
    }
  }
  const users: Record<string, UserProfile> = JSON.parse(localStorage.getItem(LS_USERS) || '{}');
  return users[uid] || null;
}

export async function updateUserSettings(uid: string, settings: Partial<UserProfile['settings']>): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { settings });
    } catch (error) {
      console.error('Firestore updateUserSettings error:', error);
    }
  }
  const users: Record<string, UserProfile> = JSON.parse(localStorage.getItem(LS_USERS) || '{}');
  if (users[uid]) {
    users[uid].settings = { ...(users[uid].settings || { voiceReminders: true, browserNotifications: true, gracePeriodMinutes: 30 }), ...settings };
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    notifyLocalChange('users');
  }
}

export async function updateUserProfileData(uid: string, updates: Partial<UserProfile>): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updates);
    } catch (error) {
      console.error('Firestore updateUserProfileData error:', error);
    }
  }
  const users: Record<string, UserProfile> = JSON.parse(localStorage.getItem(LS_USERS) || '{}');
  if (users[uid]) {
    users[uid] = { ...users[uid], ...updates };
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    notifyLocalChange('users');
  }
}

// -------------------------------------------------------------
// MEDICINE CRUD OPERATIONS
// -------------------------------------------------------------

export async function getMedicinesForUser(userId: string): Promise<Medicine[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'medicines'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const meds: Medicine[] = [];
      querySnapshot.forEach(d => meds.push({ id: d.id, ...d.data() } as Medicine));
      return meds.sort((a, b) => a.time.localeCompare(b.time));
    } catch (error) {
      console.warn('Firestore getMedicinesForUser fallback to local:', error);
    }
  }
  const allMeds: Medicine[] = JSON.parse(localStorage.getItem(LS_MEDICINES) || '[]');
  return allMeds.filter(m => m.userId === userId).sort((a, b) => a.time.localeCompare(b.time));
}

export async function addMedicineDoc(med: Omit<Medicine, 'id'>): Promise<Medicine> {
  const generatedId = 'med_' + Math.random().toString(36).substring(2, 9);
  const newMed: Medicine = { ...med, id: generatedId };

  if (isFirebaseConfigured && db) {
    try {
      const medRef = doc(db, 'medicines', generatedId);
      await setDoc(medRef, newMed);
    } catch (error) {
      console.error('Firestore addMedicineDoc error:', error);
    }
  }

  const allMeds: Medicine[] = JSON.parse(localStorage.getItem(LS_MEDICINES) || '[]');
  allMeds.push(newMed);
  localStorage.setItem(LS_MEDICINES, JSON.stringify(allMeds));
  notifyLocalChange('medicines');
  return newMed;
}

export async function updateMedicineDoc(id: string, updates: Partial<Medicine>): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const medRef = doc(db, 'medicines', id);
      await updateDoc(medRef, updates);
    } catch (error) {
      console.error('Firestore updateMedicineDoc error:', error);
    }
  }

  const allMeds: Medicine[] = JSON.parse(localStorage.getItem(LS_MEDICINES) || '[]');
  const index = allMeds.findIndex(m => m.id === id);
  if (index !== -1) {
    allMeds[index] = { ...allMeds[index], ...updates };
    localStorage.setItem(LS_MEDICINES, JSON.stringify(allMeds));
    notifyLocalChange('medicines');
  }
}

export async function deleteMedicineDoc(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'medicines', id));
    } catch (error) {
      console.error('Firestore deleteMedicineDoc error:', error);
    }
  }

  const allMeds: Medicine[] = JSON.parse(localStorage.getItem(LS_MEDICINES) || '[]');
  const filtered = allMeds.filter(m => m.id !== id);
  localStorage.setItem(LS_MEDICINES, JSON.stringify(filtered));
  notifyLocalChange('medicines');
}

export function subscribeToMedicines(userId: string, callback: (meds: Medicine[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'medicines'), where('userId', '==', userId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const meds: Medicine[] = [];
        snapshot.forEach(d => meds.push({ id: d.id, ...d.data() } as Medicine));
        callback(meds.sort((a, b) => a.time.localeCompare(b.time)));
      }, (error) => {
        console.warn('Firestore onSnapshot medicines error:', error);
      });
      return unsubscribe;
    } catch (err) {
      console.warn('Firebase subscribeToMedicines error:', err);
    }
  }

  // Local listener
  const readLocal = () => {
    const allMeds: Medicine[] = JSON.parse(localStorage.getItem(LS_MEDICINES) || '[]');
    callback(allMeds.filter(m => m.userId === userId).sort((a, b) => a.time.localeCompare(b.time)));
  };
  readLocal();

  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (!custom.detail || custom.detail.collectionName === 'medicines') {
      readLocal();
    }
  };
  window.addEventListener(LOCAL_EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(LOCAL_EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

// -------------------------------------------------------------
// MEDICINE LOGS OPERATIONS
// -------------------------------------------------------------

export async function getLogsForUser(userId: string): Promise<MedicineLog[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'medicineLogs'),
        where('userId', '==', userId),
        orderBy('scheduledTime', 'desc')
      );
      const snapshot = await getDocs(q);
      const logs: MedicineLog[] = [];
      snapshot.forEach(d => logs.push({ id: d.id, ...d.data() } as MedicineLog));
      return logs;
    } catch (error) {
      console.warn('Firestore getLogsForUser fallback:', error);
    }
  }
  const allLogs: MedicineLog[] = JSON.parse(localStorage.getItem(LS_LOGS) || '[]');
  return allLogs
    .filter(l => l.userId === userId)
    .sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime));
}

export async function saveMedicineLogDoc(log: MedicineLog): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const logRef = doc(db, 'medicineLogs', log.id);
      await setDoc(logRef, log, { merge: true });
    } catch (error) {
      console.error('Firestore saveMedicineLogDoc error:', error);
    }
  }

  const allLogs: MedicineLog[] = JSON.parse(localStorage.getItem(LS_LOGS) || '[]');
  const index = allLogs.findIndex(l => l.id === log.id);
  if (index !== -1) {
    allLogs[index] = { ...allLogs[index], ...log };
  } else {
    allLogs.push(log);
  }
  localStorage.setItem(LS_LOGS, JSON.stringify(allLogs));
  notifyLocalChange('medicineLogs');
}

export async function updateLogStatus(
  logId: string,
  status: LogStatus,
  actionTime: string = new Date().toISOString(),
  snoozeUntil?: string
): Promise<void> {
  const updates: Partial<MedicineLog> = {
    status,
    actionTime,
    ...(snoozeUntil ? { snoozeUntil } : {})
  };

  if (isFirebaseConfigured && db) {
    try {
      const logRef = doc(db, 'medicineLogs', logId);
      await updateDoc(logRef, updates);
    } catch (error) {
      console.error('Firestore updateLogStatus error:', error);
    }
  }

  const allLogs: MedicineLog[] = JSON.parse(localStorage.getItem(LS_LOGS) || '[]');
  const index = allLogs.findIndex(l => l.id === logId);
  if (index !== -1) {
    allLogs[index] = { ...allLogs[index], ...updates };
    localStorage.setItem(LS_LOGS, JSON.stringify(allLogs));
    notifyLocalChange('medicineLogs');
  }
}

export function subscribeToLogsForUser(userId: string, callback: (logs: MedicineLog[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'medicineLogs'),
        where('userId', '==', userId)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs: MedicineLog[] = [];
        snapshot.forEach(d => logs.push({ id: d.id, ...d.data() } as MedicineLog));
        callback(logs.sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime)));
      }, (error) => {
        console.warn('Firestore onSnapshot logs error:', error);
      });
      return unsubscribe;
    } catch (err) {
      console.warn('Firebase subscribeToLogsForUser error:', err);
    }
  }

  const readLocal = () => {
    const allLogs: MedicineLog[] = JSON.parse(localStorage.getItem(LS_LOGS) || '[]');
    callback(
      allLogs
        .filter(l => l.userId === userId)
        .sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime))
    );
  };
  readLocal();

  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (!custom.detail || custom.detail.collectionName === 'medicineLogs') {
      readLocal();
    }
  };
  window.addEventListener(LOCAL_EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(LOCAL_EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

// -------------------------------------------------------------
// CAREGIVER LINK OPERATIONS
// -------------------------------------------------------------

export async function findPatientByCaregiverCode(code: string): Promise<UserProfile | null> {
  const cleanCode = code.trim().toUpperCase();
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'users'), where('caregiverCode', '==', cleanCode), where('role', '==', 'patient'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as UserProfile;
      }
    } catch (error) {
      console.warn('Firestore findPatientByCode fallback:', error);
    }
  }
  const users: Record<string, UserProfile> = JSON.parse(localStorage.getItem(LS_USERS) || '{}');
  for (const u of Object.values(users)) {
    if (u.role === 'patient' && u.caregiverCode?.toUpperCase() === cleanCode) {
      return u;
    }
  }
  // Demo check
  if (cleanCode === 'MED-4821') {
    return {
      uid: 'demo_patient_101',
      name: 'Lakshmi Patel',
      email: 'lakshmi@medimate.ai',
      role: 'patient',
      caregiverCode: 'MED-4821',
      createdAt: new Date().toISOString()
    };
  }
  return null;
}

export async function createCaregiverLinkRequest(
  caregiver: UserProfile,
  patient: UserProfile
): Promise<CaregiverLink> {
  const linkId = `link_${caregiver.uid}_${patient.uid}`;
  const newLink: CaregiverLink = {
    id: linkId,
    patientId: patient.uid,
    patientName: patient.name,
    patientEmail: patient.email,
    caregiverId: caregiver.uid,
    caregiverName: caregiver.name,
    caregiverEmail: caregiver.email,
    status: 'pending',
    connectionCode: patient.caregiverCode || '',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const linkRef = doc(db, 'caregiverLinks', linkId);
      await setDoc(linkRef, newLink);
    } catch (error) {
      console.error('Firestore createCaregiverLinkRequest error:', error);
    }
  }

  const links: CaregiverLink[] = JSON.parse(localStorage.getItem(LS_LINKS) || '[]');
  const existingIdx = links.findIndex(l => l.id === linkId);
  if (existingIdx !== -1) {
    links[existingIdx] = newLink;
  } else {
    links.push(newLink);
  }
  localStorage.setItem(LS_LINKS, JSON.stringify(links));
  notifyLocalChange('caregiverLinks');
  return newLink;
}

export async function updateCaregiverLinkStatus(linkId: string, status: CaregiverLinkStatus): Promise<void> {
  const updates = { status, updatedAt: new Date().toISOString() };

  if (isFirebaseConfigured && db) {
    try {
      const linkRef = doc(db, 'caregiverLinks', linkId);
      await updateDoc(linkRef, updates);
    } catch (error) {
      console.error('Firestore updateCaregiverLinkStatus error:', error);
    }
  }

  const links: CaregiverLink[] = JSON.parse(localStorage.getItem(LS_LINKS) || '[]');
  const idx = links.findIndex(l => l.id === linkId);
  if (idx !== -1) {
    links[idx] = { ...links[idx], ...updates };
    localStorage.setItem(LS_LINKS, JSON.stringify(links));
    notifyLocalChange('caregiverLinks');
  }
}

export function subscribeToCaregiverLinksForPatient(patientId: string, callback: (links: CaregiverLink[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'caregiverLinks'), where('patientId', '==', patientId));
      return onSnapshot(q, (snapshot) => {
        const links: CaregiverLink[] = [];
        snapshot.forEach(d => links.push({ id: d.id, ...d.data() } as CaregiverLink));
        callback(links);
      });
    } catch (error) {
      console.warn('Firebase subscribe links for patient error:', error);
    }
  }

  const readLocal = () => {
    const links: CaregiverLink[] = JSON.parse(localStorage.getItem(LS_LINKS) || '[]');
    callback(links.filter(l => l.patientId === patientId));
  };
  readLocal();

  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (!custom.detail || custom.detail.collectionName === 'caregiverLinks') {
      readLocal();
    }
  };
  window.addEventListener(LOCAL_EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(LOCAL_EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

export function subscribeToCaregiverLinksForCaregiver(caregiverId: string, callback: (links: CaregiverLink[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'caregiverLinks'), where('caregiverId', '==', caregiverId));
      return onSnapshot(q, (snapshot) => {
        const links: CaregiverLink[] = [];
        snapshot.forEach(d => links.push({ id: d.id, ...d.data() } as CaregiverLink));
        callback(links);
      });
    } catch (error) {
      console.warn('Firebase subscribe links for caregiver error:', error);
    }
  }

  const readLocal = () => {
    const links: CaregiverLink[] = JSON.parse(localStorage.getItem(LS_LINKS) || '[]');
    callback(links.filter(l => l.caregiverId === caregiverId));
  };
  readLocal();

  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (!custom.detail || custom.detail.collectionName === 'caregiverLinks') {
      readLocal();
    }
  };
  window.addEventListener(LOCAL_EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(LOCAL_EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

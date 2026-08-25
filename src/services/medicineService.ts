import {
  getMedicinesForUser,
  addMedicineDoc,
  updateMedicineDoc,
  deleteMedicineDoc,
  subscribeToMedicines
} from '../firebase/firestore';
import { Medicine } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

export async function fetchMedicines(userId: string): Promise<Medicine[]> {
  return await getMedicinesForUser(userId);
}

export async function createMedicine(
  data: Omit<Medicine, 'id' | 'createdAt' | 'active'>
): Promise<Medicine> {
  const newMed = await addMedicineDoc({
    ...data,
    active: true,
    createdAt: new Date().toISOString()
  });
  return newMed;
}

export async function updateMedicine(id: string, updates: Partial<Medicine>): Promise<void> {
  await updateMedicineDoc(id, updates);
}

export async function deleteMedicine(id: string): Promise<void> {
  await deleteMedicineDoc(id);
}

export async function toggleMedicineActive(id: string, currentActive: boolean): Promise<void> {
  await updateMedicineDoc(id, { active: !currentActive });
}

export function subscribeUserMedicines(userId: string, callback: (meds: Medicine[]) => void): () => void {
  return subscribeToMedicines(userId, callback);
}

export async function seedDemoMedicines(userId: string): Promise<Medicine[]> {
  const today = getTodayDateString();
  const demoList: Omit<Medicine, 'id' | 'createdAt' | 'active'>[] = [
    {
      userId,
      name: 'Metformin',
      dosage: '1 tablet',
      time: '08:00',
      frequency: 'Daily',
      foodInstruction: 'After breakfast',
      startDate: today,
      notes: 'For blood sugar management with morning meal.'
    },
    {
      userId,
      name: 'Vitamin D',
      dosage: '1 capsule',
      time: '13:00',
      frequency: 'Daily',
      foodInstruction: 'After lunch',
      startDate: today,
      notes: 'Take with food for optimal absorption.'
    },
    {
      userId,
      name: 'BP Tablet',
      dosage: '1 tablet',
      time: '20:00',
      frequency: 'Daily',
      foodInstruction: 'After dinner',
      startDate: today,
      notes: 'Evening blood pressure maintenance.'
    }
  ];

  const created: Medicine[] = [];
  for (const item of demoList) {
    const med = await createMedicine(item);
    created.push(med);
  }
  return created;
}

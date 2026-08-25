import { useState, useEffect, useCallback } from 'react';
import { Medicine } from '../types';
import { 
  fetchMedicines, 
  createMedicine, 
  updateMedicine, 
  deleteMedicine, 
  toggleMedicineActive, 
  subscribeUserMedicines,
  seedDemoMedicines 
} from '../services/medicineService';
import { useAuth } from './useAuth';

export function useMedicines() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setMedicines([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeUserMedicines(user.uid, (meds) => {
      setMedicines(meds);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const addMedicine = useCallback(async (data: Omit<Medicine, 'id' | 'createdAt' | 'active'>) => {
    if (!user) throw new Error('Must be logged in to add medicine');
    try {
      const created = await createMedicine(data);
      return created;
    } catch (err: any) {
      setError(err.message || 'Failed to add medicine');
      throw err;
    }
  }, [user]);

  const editMedicine = useCallback(async (id: string, updates: Partial<Medicine>) => {
    try {
      await updateMedicine(id, updates);
    } catch (err: any) {
      setError(err.message || 'Failed to update medicine');
      throw err;
    }
  }, []);

  const removeMedicine = useCallback(async (id: string) => {
    try {
      await deleteMedicine(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete medicine');
      throw err;
    }
  }, []);

  const togglePause = useCallback(async (id: string, currentActive: boolean) => {
    try {
      await toggleMedicineActive(id, currentActive);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle medicine status');
      throw err;
    }
  }, []);

  const seedDemo = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    try {
      const seeded = await seedDemoMedicines(user.uid);
      return seeded;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    medicines,
    loading,
    error,
    addMedicine,
    editMedicine,
    removeMedicine,
    togglePause,
    seedDemo,
    reload: () => user && fetchMedicines(user.uid).then(setMedicines)
  };
}

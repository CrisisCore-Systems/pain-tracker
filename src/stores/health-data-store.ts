import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { HealthRecord } from '../services/importers/types';
import { createEncryptedOfflinePersistStorage } from './encrypted-idb-persist';

interface HealthDataState {
  records: HealthRecord[];
  lastImportDate: string | null;
  
  // Actions
  addRecords: (newRecords: HealthRecord[]) => void;
  clearRecords: () => void;
  
  // Selectors
  getRecordsByType: (type: HealthRecord['type']) => HealthRecord[];
}

const encryptedStorage: PersistStorage<HealthDataState> = 
  createEncryptedOfflinePersistStorage<HealthDataState>('health-data-storage');

export const useHealthDataStore = create<HealthDataState>()(
  persist(
    immer((set, get) => ({
      records: [],
      lastImportDate: null,

      addRecords: (newRecords) => 
        set((state) => {
          // In a real app, we'd dedup here. For now, just append.
          state.records.push(...newRecords);
          state.lastImportDate = new Date().toISOString();
        }),

      clearRecords: () => 
        set((state) => {
          state.records = [];
          state.lastImportDate = null;
        }),

      getRecordsByType: (type) => {
        return get().records.filter(r => r.type === type);
      }
    })),
    {
      name: 'health-data-storage',
      storage: encryptedStorage,
    }
  )
);

import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { format } from 'date-fns';
import type { DailyEnergyBudget, EnergySettings, EnergyTransaction, EnergyCategory } from '../types/energy';
import { createEncryptedOfflinePersistStorage } from './encrypted-idb-persist';

interface EnergyState {
  settings: EnergySettings;
  history: Record<string, DailyEnergyBudget>; // yyyy-MM-dd -> Budget

  // Actions
  updateSettings: (settings: Partial<EnergySettings>) => void;
  setDailyCapacity: (date: string, capacity: number) => void;
  logTransaction: (transaction: Omit<EnergyTransaction, 'id' | 'timestamp'>, date?: string) => void;
  deleteTransaction: (id: string, date: string) => void;
  
  // Computeds (helper functions)
  getBudgetForDate: (date: string) => DailyEnergyBudget;
}

const DEFAULT_SETTINGS: EnergySettings = {
  defaultDailyCapacity: 12, // "12 Spoons" is the classic metaphor
  enableAlerts: true,
  alertThreshold: 0.8,
  autoResetTime: '04:00',
};

const encryptedStorage: PersistStorage<EnergyState> = 
  createEncryptedOfflinePersistStorage<EnergyState>('energy-budget-storage');

export const useEnergyStore = create<EnergyState>()(
  persist(
    immer((set, get) => ({
      settings: DEFAULT_SETTINGS,
      history: {},

      updateSettings: (newSettings) => 
        set((state) => {
          state.settings = { ...state.settings, ...newSettings };
        }),

      setDailyCapacity: (date, capacity) => 
        set((state) => {
          if (!state.history[date]) {
            state.history[date] = { date, capacity, transactions: [] };
          } else {
            state.history[date].capacity = capacity;
          }
        }),

      logTransaction: (txn, date) => 
        set((state) => {
          const targetDate = date || format(new Date(), 'yyyy-MM-dd');
          
          // Ensure day exists
          if (!state.history[targetDate]) {
            state.history[targetDate] = {
              date: targetDate,
              capacity: state.settings.defaultDailyCapacity,
              transactions: [],
            };
          }

          const newTransaction: EnergyTransaction = {
            ...txn,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          };

          state.history[targetDate].transactions.push(newTransaction);
        }),

      deleteTransaction: (id, date) =>
        set((state) => {
          if (state.history[date]) {
            state.history[date].transactions = state.history[date].transactions.filter(
              (t) => t.id !== id
            );
          }
        }),

      getBudgetForDate: (date) => {
        const state = get();
        return (
          state.history[date] || {
            date,
            capacity: state.settings.defaultDailyCapacity,
            transactions: [],
          }
        );
      },
    })),
    {
      name: 'energy-budget-storage',
      storage: encryptedStorage,
      partialize: (state) => ({
        settings: state.settings,
        history: state.history
      }) as EnergyState, 
    }
  )
);

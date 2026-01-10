/**
 * Energy Method / "Spoon Theory" Types
 * 
 * Used for the Activity Pacing module in Phase 4.
 */

export type EnergyCategory = 'physical' | 'cognitive' | 'emotional' | 'social' | 'rest';

export interface EnergyTransaction {
  id: string;
  timestamp: string; // ISO String
  activityName: string;
  cost: number; // Positive = drains energy, Negative = replenishes energy
  category: EnergyCategory;
  notes?: string;
  intensity?: number; // 0-10 intensity of the activity itself
}

export interface DailyEnergyBudget {
  date: string; // YYYY-MM-DD
  capacity: number; // The user's total "spoons" for this specific day
  transactions: EnergyTransaction[];
}

export interface EnergySettings {
  defaultDailyCapacity: number; // The user's baseline "Spoon" count
  enableAlerts: boolean;
  alertThreshold: number; // 0.0 to 1.0 (e.g. 0.8 for 80%)
  autoResetTime: string; // "04:00" - when the "new day" starts
}

/**
 * Pain tracker specific typings used by the advanced analytics and export
 * services.
 *
 * NOTE: The canonical PainEntry type is defined in ./index.ts
 * This file re-exports it for backwards compatibility and provides
 * additional minimal types needed by analytics modules.
 *
 * @deprecated Import PainEntry directly from '../types' or './index'
 */

// Re-export from canonical types/index.ts
export type { PainEntry } from './index';

/**
 * Minimal mood entry representation required by the clinical export and
 * analytics layers.  It deliberately keeps only the properties these modules
 * consume to avoid importing the considerably larger quantified empathy type.
 */
export interface MoodEntry {
  id?: string | number;
  timestamp: string | Date;
  mood: number;
  notes?: string;
}


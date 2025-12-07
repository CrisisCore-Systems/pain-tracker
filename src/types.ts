/**
 * Core Application Types
 *
 * This file re-exports the PainEntry interface from types/index.ts
 * and validation schemas from types/pain-entry.ts.
 *
 * IMPORTANT: The PainEntry interface in types/index.ts is the canonical type.
 * Zod schemas in types/pain-entry.ts are for runtime validation only.
 */

// Re-export canonical PainEntry interface from types/index.ts
export type {
  PainEntry,
} from './types/index';

// Re-export validation schemas and helpers from pain-entry.ts
export {
  PainEntrySchema,
  CreatePainEntrySchema,
  UpdatePainEntrySchema,
  BaselineDataSchema,
  TreatmentSchema,
  MedicationSchema,
  FunctionalImpactSchema,
  QualityOfLifeSchema,
  WorkImpactSchema,
  validatePainEntry,
  safeParsePainEntry,
  validateCreatePainEntry,
  getEffectivePainLevel,
  getAllLocations,
} from './types/pain-entry';

// Export type aliases for validation schema types
export type {
  Treatment,
  Medication,
  CreatePainEntry,
  UpdatePainEntry,
} from './types/pain-entry';

// WCB-specific WorkImpact (different structure from PainEntry's workImpact)
export interface WorkImpact {
  limitations: Array<[string, number]>;
  accommodationsNeeded: string[];
  missedDays?: number;
}

export interface WCBReport {
  id: string;
  createdAt: string;
  period?: {
    start: string;
    end: string;
  };
  claimInfo?: {
    claimNumber?: string;
    injuryDate?: string;
  };
  workImpact: WorkImpact;
  functionalAnalysis: {
    limitations: string[];
    deterioration: string[];
    improvements: string[];
  };
  treatments: {
    current: Array<{ treatment: string; frequency: number }>;
    effectiveness: string;
  };
  painTrends?: {
    average: number;
    progression?: Array<{
      date: string;
      pain: number;
      locations?: string[];
      symptoms?: string[];
    }>;
    locations: Record<string, number>;
  };
  recommendations: string[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'summary' | 'detailed' | 'clinical' | 'progress';
  sections: unknown[];
  createdAt: string;
  lastModified: string;
}

// Re-export types from index.ts for convenience
export type {
  EmergencyContact,
  EmergencyProtocol,
  EmergencyPanelData,
  ReportSection,
  ScheduledReport,
  ActivityLogEntry,
} from './types/index';


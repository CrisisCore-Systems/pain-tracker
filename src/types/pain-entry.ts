/**
 * Consolidated PainEntry Type Definition
 *
 * This file provides Zod schemas for runtime validation of PainEntry data.
 * The canonical TypeScript interface for PainEntry is in types/index.ts.
 *
 * @module types/pain-entry
 */

import { z } from 'zod';
import type { PainEntry } from './index';

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

/**
 * Treatment schema for medical interventions
 */
export const TreatmentSchema = z.object({
  type: z.string(),
  provider: z.string().default(''),
  date: z.string().default(''),
  frequency: z.string().optional(),
  effectiveness: z.string().default(''),
});

/**
 * Medication schema for current medications
 */
export const MedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().default(''),
  frequency: z.string().default(''),
  effectiveness: z.string().default(''),
});

/**
 * Baseline data schema - core pain information
 */
export const BaselineDataSchema = z.object({
  /** Pain level 0-10 scale */
  pain: z.number().min(0).max(10),
  /** Affected body locations */
  locations: z.array(z.string()).default([]),
  /** Associated symptoms */
  symptoms: z.array(z.string()).default([]),
});

/**
 * Functional impact schema
 */
export const FunctionalImpactSchema = z.object({
  limitedActivities: z.array(z.string()).default([]),
  assistanceNeeded: z.array(z.string()).default([]),
  mobilityAids: z.array(z.string()).default([]),
});

/**
 * Quality of life schema
 */
export const QualityOfLifeSchema = z.object({
  sleepQuality: z.number().min(0).max(10).default(0),
  moodImpact: z.number().min(0).max(10).default(0),
  socialImpact: z.array(z.string()).default([]),
});

/**
 * Work impact schema
 */
export const WorkImpactSchema = z.object({
  missedWork: z.number().min(0).default(0),
  modifiedDuties: z.array(z.string()).default([]),
  workLimitations: z.array(z.string()).default([]),
});

/**
 * Medications section schema
 */
export const MedicationsSectionSchema = z.object({
  current: z.array(MedicationSchema).default([]),
  changes: z.string().default(''),
  effectiveness: z.string().default(''),
});

/**
 * Treatments section schema
 */
export const TreatmentsSectionSchema = z.object({
  recent: z.array(TreatmentSchema).default([]),
  effectiveness: z.string().default(''),
  planned: z.array(z.string()).default([]),
});

/**
 * Comparison section schema
 */
export const ComparisonSchema = z.object({
  worseningSince: z.string().default(''),
  newLimitations: z.array(z.string()).default([]),
});

/**
 * Complete PainEntry schema with all fields
 * This is the authoritative schema for validation
 */
export const PainEntrySchema = z.object({
  /** Unique identifier - can be string or number for backwards compatibility */
  id: z.union([z.string(), z.number()]).optional(),

  /**
   * ISO 8601 timestamp string (UTC recommended)
   * Note: All timestamps should be stored in UTC. Local time conversion
   * happens at display time only.
   */
  timestamp: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: 'Invalid timestamp format' }
  ),

  /** Core pain data - required */
  baselineData: BaselineDataSchema,

  /** Optional notes/journal entry */
  notes: z.string().optional().default(''),

  /** Identified triggers */
  triggers: z.array(z.string()).optional().default([]),

  /** Functional impact on daily activities */
  functionalImpact: FunctionalImpactSchema.default({
    limitedActivities: [],
    assistanceNeeded: [],
    mobilityAids: [],
  }),

  /** Quality of life metrics */
  qualityOfLife: QualityOfLifeSchema.default({
    sleepQuality: 0,
    moodImpact: 0,
    socialImpact: [],
  }),

  /** Work-related impact */
  workImpact: WorkImpactSchema.default({
    missedWork: 0,
    modifiedDuties: [],
    workLimitations: [],
  }),

  /** Current medications */
  medications: MedicationsSectionSchema.default({
    current: [],
    changes: '',
    effectiveness: '',
  }),

  /** Treatment history */
  treatments: TreatmentsSectionSchema.default({
    recent: [],
    effectiveness: '',
    planned: [],
  }),

  /** Comparison to previous state */
  comparison: ComparisonSchema.default({
    worseningSince: '',
    newLimitations: [],
  }),

  // ============================================================================
  // Extended fields for analytics modules
  // These provide alternative access patterns while maintaining compatibility
  // ============================================================================

  /**
   * Explicit numeric intensity (0-10).
   * Falls back to baselineData.pain when not provided.
   * Used by analytics modules.
   */
  intensity: z.number().min(0).max(10).optional(),

  /**
   * Primary location descriptor for clinical summaries.
   * Single string alternative to baselineData.locations array.
   */
  location: z.string().optional(),

  /**
   * Pain quality descriptors (e.g., 'sharp', 'dull', 'burning')
   */
  quality: z.array(z.string()).optional(),

  /**
   * Relief methods attempted
   */
  reliefMethods: z.array(z.string()).optional(),

  /**
   * Activity level at time of entry (0-10)
   */
  activityLevel: z.number().min(0).max(10).optional(),

  /**
   * Weather conditions (for correlation analysis)
   */
  weather: z.string().optional(),

  /**
   * Sleep quality rating (alternative to qualityOfLife.sleepQuality)
   */
  sleep: z.number().min(0).max(10).optional(),

  /**
   * Mood rating (alternative to qualityOfLife.moodImpact)
   */
  mood: z.number().min(0).max(10).optional(),

  /**
   * Stress level (0-10)
   */
  stress: z.number().min(0).max(10).optional(),

  /**
   * Physical activities performed
   */
  activities: z.array(z.string()).optional(),
  
  /** Medication adherence for scheduled meds (optional) */
  medicationAdherence: z
    .enum(['as_prescribed', 'partial', 'missed', 'not_applicable'])
    .optional(),
});

/**
 * Schema for creating new entries (id and timestamp generated automatically)
 */
export const CreatePainEntrySchema = PainEntrySchema.omit({
  id: true,
  timestamp: true,
}).superRefine((value, ctx) => {
  const locationCount = value.baselineData?.locations?.length ?? 0;
  if (locationCount === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['baselineData', 'locations'],
      message: 'Select at least one location.',
    });
  }
});

/**
 * Schema for updating entries (all fields optional except id)
 */
export const UpdatePainEntrySchema = PainEntrySchema.partial().required({ id: true });

// ============================================================================
// TypeScript Types (derived from Zod schemas)
// ============================================================================

/** Treatment intervention type */
export type Treatment = z.infer<typeof TreatmentSchema>;

/** Medication entry type */
export type Medication = z.infer<typeof MedicationSchema>;

/** Core pain baseline data */
export type BaselineData = z.infer<typeof BaselineDataSchema>;

/** Functional impact data */
export type FunctionalImpact = z.infer<typeof FunctionalImpactSchema>;

/** Quality of life metrics */
export type QualityOfLife = z.infer<typeof QualityOfLifeSchema>;

/** Work impact data */
export type WorkImpact = z.infer<typeof WorkImpactSchema>;

/**
 * Complete PainEntry type - the authoritative type for pain entries
 *
 * NOTE: The canonical PainEntry interface is defined in types/index.ts
 * This type alias exists for Zod schema inference but should NOT be
 * used directly. Import PainEntry from '@/types' or '@/types/index' instead.
 * 
 * @internal Use PainEntry from types/index.ts instead
 */
type _ZodPainEntry = z.infer<typeof PainEntrySchema>;

/** Type for creating new entries (omits auto-generated fields) */
export type CreatePainEntry = z.infer<typeof CreatePainEntrySchema>;

/** Type for updating entries */
export type UpdatePainEntry = z.infer<typeof UpdatePainEntrySchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate a pain entry at runtime
 * @param data - Unknown data to validate
 * @returns Validated PainEntry or throws ZodError
 */
export function validatePainEntry(data: unknown): PainEntry {
  return PainEntrySchema.parse(data) as PainEntry;
}

/**
 * Safely validate a pain entry, returning result object
 * @param data - Unknown data to validate
 * @returns Object with success flag and data or error
 */
export function safeParsePainEntry(data: unknown) {
  return PainEntrySchema.safeParse(data);
}

/**
 * Validate data for creating a new entry
 * @param data - Data without id/timestamp
 * @returns Validated CreatePainEntry
 */
export function validateCreatePainEntry(data: unknown): CreatePainEntry {
  return CreatePainEntrySchema.parse(data);
}

/**
 * Get the effective pain intensity from an entry
 * Handles both baselineData.pain and intensity field (if present)
 * @param entry - Pain entry
 * @returns Pain intensity 0-10
 */
export function getEffectivePainLevel(entry: PainEntry): number {
  // Handle extended entries that may have an intensity field
  const extended = entry as PainEntry & { intensity?: number };
  return extended.intensity ?? entry.baselineData.pain;
}

/**
 * Get all locations from an entry
 * Combines baselineData.locations and location field (if present)
 * @param entry - Pain entry
 * @returns Array of location strings
 */
export function getAllLocations(entry: PainEntry): string[] {
  const locations = [...(entry.baselineData.locations ?? [])];
  // Handle extended entries that may have a location field
  const extended = entry as PainEntry & { location?: string };
  if (extended.location && !locations.includes(extended.location)) {
    locations.push(extended.location);
  }
  return locations;
}

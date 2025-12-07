/**
 * PainEntry Zod Schema
 *
 * @deprecated This file is maintained for backwards compatibility.
 * Import schemas directly from '../types/pain-entry' or '../types'
 */

// Re-export schemas from pain-entry module
export {
  PainEntrySchema,
  CreatePainEntrySchema,
  UpdatePainEntrySchema,
  BaselineDataSchema,
  TreatmentSchema,
  MedicationSchema,
  validatePainEntry,
  safeParsePainEntry,
} from '../types/pain-entry';

// Re-export canonical PainEntry type from types/index
export type { PainEntry } from '../types/index';

export default null; // Deprecated - use named exports


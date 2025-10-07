import type { PainEntry as DetailedPainEntry } from '../types';

/**
 * Pain tracker specific typings used by the advanced analytics and export
 * services. The types extend the broader application definitions with the
 * additional fields these modules expect while remaining compatible with the
 * data collected in the core tracker experience.
 */

export interface PainEntry extends DetailedPainEntry {
  /**
   * Explicit numeric intensity (0-10). Falls back to baselineData.pain when
   * not provided so legacy entries remain compatible.
   */
  intensity?: number;
  /**
   * Primary location descriptor used for clinical summaries.
   */
  location?: string;
  /**
   * Descriptors describing the character/quality of the pain.
   */
  quality?: string[];
  /**
   * Recorded triggers that preceded the entry.
   */
  triggers?: string[];
  /**
   * Interventions or actions attempted for relief.
   */
  reliefMethods?: string[];
  /**
   * Optional activity level used by analytics modules.
   */
  activityLevel?: number;
}

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


import { secureStorage } from '../lib/storage/secureStorage';
import type { TonePreferences } from '../types/tone';
import { DEFAULT_TONE_PREFERENCES } from '../types/tone';

// Class C preference: UI communication style only.
export const TONE_PREFERENCES_STORAGE_KEY = 'pain-tracker:tone-preferences';

function coerceTonePreferences(raw: unknown): TonePreferences {
  const obj = (raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >;

  const warmth = obj.warmth === 1 || obj.warmth === '1' ? 1 : 0;
  const coachIntensity = obj.coachIntensity === 1 || obj.coachIntensity === '1' ? 1 : 0;
  const allowLightness = typeof obj.allowLightness === 'boolean' ? obj.allowLightness : false;
  const medicalTerms = typeof obj.medicalTerms === 'boolean' ? obj.medicalTerms : false;

  return {
    warmth,
    coachIntensity,
    allowLightness,
    medicalTerms,
  };
}

/**
 * Read current tone preferences.
 * Migrates legacy localStorage key `tone-preferences` into secureStorage.
 */
export function readTonePreferences(): TonePreferences {
  // 1) Prefer secureStorage (canonical)
  const stored = secureStorage.safeJSON<unknown>(TONE_PREFERENCES_STORAGE_KEY, DEFAULT_TONE_PREFERENCES);
  const parsed = coerceTonePreferences(stored);

  // 2) If secureStorage is still default, attempt one-time migration from legacy localStorage
  const isDefault =
    parsed.warmth === DEFAULT_TONE_PREFERENCES.warmth &&
    parsed.coachIntensity === DEFAULT_TONE_PREFERENCES.coachIntensity &&
    parsed.allowLightness === DEFAULT_TONE_PREFERENCES.allowLightness &&
    parsed.medicalTerms === DEFAULT_TONE_PREFERENCES.medicalTerms;

  if (!isDefault) return parsed;

  try {
    const legacy = localStorage.getItem('tone-preferences');
    if (!legacy) return parsed;

    const migrated = coerceTonePreferences(JSON.parse(legacy));
    secureStorage.set(TONE_PREFERENCES_STORAGE_KEY, migrated);
    localStorage.removeItem('tone-preferences');
    return migrated;
  } catch {
    return parsed;
  }
}

export function writeTonePreferences(updates: Partial<TonePreferences>): TonePreferences {
  const current = readTonePreferences();
  const next = { ...current, ...updates } satisfies TonePreferences;
  secureStorage.set(TONE_PREFERENCES_STORAGE_KEY, next);
  return next;
}

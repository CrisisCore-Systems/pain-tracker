import type { PainEntry } from '../../types';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

interface StorageError extends Error {
  code: 'STORAGE_FULL' | 'PARSE_ERROR' | 'WRITE_ERROR' | 'NOT_FOUND';
}

/**
 * Creates a storage error with a specific code and message
 */
const createStorageError = (code: StorageError['code'], message: string): StorageError => {
  const error = new Error(message) as StorageError;
  error.code = code;
  return error;
};

/**
 * Legacy compatibility API.
 *
 * NOTE: This module intentionally no longer persists to localStorage.
 * It delegates to the canonical `usePainTrackerStore`, which persists
 * via the app's encrypted IndexedDB-backed boundary.
 */
export const savePainEntry = async (entry: PainEntry): Promise<void> => {
  try {
    const state = usePainTrackerStore.getState();
    const existingIndex = state.entries.findIndex(e => e.id === entry.id);
    if (existingIndex !== -1) {
      state.updateEntry(entry.id, entry);
    } else {
      // Store's public addEntry API generates ids/timestamps; we preserve legacy ids
      // by updating the store state directly through setState.
      usePainTrackerStore.setState(s => ({ ...s, entries: [...s.entries, entry] }));
    }
  } catch (e) {
    if ((e as StorageError).code) {
      throw e;
    }
    throw createStorageError('WRITE_ERROR', 'Failed to save pain entry.');
  }
};

/**
 * Loads all pain entries from local storage
 * @throws {StorageError} If data cannot be parsed or is not found
 */
export const loadPainEntries = async (): Promise<PainEntry[]> => {
  try {
    // Ensure persisted state has had a chance to hydrate.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const persistApi = (usePainTrackerStore as any).persist;
    try {
      await persistApi?.rehydrate?.();
    } catch {
      // ignore hydration issues; return whatever is in memory
    }
    const entries = usePainTrackerStore.getState().entries;
    if (!Array.isArray(entries) || !entries.every(isValidPainEntry)) {
      throw createStorageError('PARSE_ERROR', 'Stored data is corrupted.');
    }
    return entries;
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw createStorageError('PARSE_ERROR', 'Failed to parse stored pain entries.');
    }
    if ((e as StorageError).code) {
      throw e;
    }
    throw createStorageError('NOT_FOUND', 'No pain entries found.');
  }
};

/**
 * Deletes all pain entries from storage
 * @throws {StorageError} If deletion fails
 */
export const clearPainEntries = async (): Promise<void> => {
  try {
    usePainTrackerStore.setState(s => ({ ...s, entries: [] }));
  } catch {
    throw createStorageError('WRITE_ERROR', 'Failed to clear pain entries.');
  }
};

/**
 * Type guard to validate PainEntry structure
 * Accepts both number and string IDs as per PainEntry type definition
 */
const isValidPainEntry = (entry: unknown): entry is PainEntry => {
  if (!entry || typeof entry !== 'object') return false;

  const e = entry as Partial<PainEntry>;
  return (
    (typeof e.id === 'number' || typeof e.id === 'string') &&
    typeof e.timestamp === 'string' &&
    e.baselineData !== undefined &&
    typeof e.baselineData.pain === 'number' &&
    Array.isArray(e.baselineData.locations) &&
    Array.isArray(e.baselineData.symptoms) &&
    e.functionalImpact !== undefined &&
    Array.isArray(e.functionalImpact.limitedActivities) &&
    Array.isArray(e.functionalImpact.assistanceNeeded) &&
    Array.isArray(e.functionalImpact.mobilityAids)
  );
};

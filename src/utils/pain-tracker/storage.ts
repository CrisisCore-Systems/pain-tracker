import type { PainEntry } from "../../types";

const STORAGE_KEY = 'pain_tracker_entries';

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
 * Saves a pain entry to local storage
 * @throws {StorageError} If storage is full or write fails
 */
export const savePainEntry = async (entry: PainEntry): Promise<void> => {
  try {
    const existingEntries = await loadPainEntries();
    const updatedEntries = [...existingEntries];
    
    // Find and update existing entry or add new one
    const existingIndex = updatedEntries.findIndex(e => e.id === entry.id);
    if (existingIndex !== -1) {
      updatedEntries[existingIndex] = entry;
    } else {
      updatedEntries.push(entry);
    }
    
    const serialized = JSON.stringify(updatedEntries);
    
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        throw createStorageError('STORAGE_FULL', 'Local storage is full. Please clear some space.');
      }
      throw createStorageError('WRITE_ERROR', 'Failed to save pain entry.');
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
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return [];
    }

    const entries = JSON.parse(serialized);
    
    // Validate the data structure
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
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    throw createStorageError('WRITE_ERROR', 'Failed to clear pain entries.');
  }
};

/**
 * Type guard to validate PainEntry structure
 */
const isValidPainEntry = (entry: unknown): entry is PainEntry => {
  if (!entry || typeof entry !== 'object') return false;
  
  const e = entry as Partial<PainEntry>;
  return (
    typeof e.id === 'number' &&
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

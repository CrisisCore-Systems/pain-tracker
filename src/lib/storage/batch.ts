import { estimateBytes } from './size';

export interface BatchResult {
  success: boolean;
  errors?: Array<{ key: string; error: string }>;
}

/**
 * Attempts to write a map of key=>value into storage (localStorage-like API) with optional per-item limit.
 * Non-throwing: returns partial errors in result.
 */
export function batchSet(storage: Storage, entries: Record<string, unknown>, maxPerItemBytes = 50 * 1024): BatchResult {
  const errors: BatchResult['errors'] = [];
  for (const [k, v] of Object.entries(entries)) {
    try {
      const bytes = estimateBytes(v);
      if (bytes > maxPerItemBytes) {
        errors.push({ key: k, error: 'VALUE_TOO_LARGE' });
        continue;
      }
      storage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    } catch (e) {
      errors.push({ key: k, error: (e as Error).message });
    }
  }
  return { success: errors.length === 0, errors: errors.length ? errors : undefined };
}

export default { batchSet };

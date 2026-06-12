import type { BlindIndexEngine, BlindIndexConfig, BlindIndexBackend, BlindIndexEntry } from './types';
import { createIndexedDBBlindIndexBackend } from './backend';
import { tokenizeFieldValue, normalizeFieldValue } from './crypto';

export function createBlindIndexEngine(backend: BlindIndexBackend, config: BlindIndexConfig = {}): BlindIndexEngine {
  const pepper = config.pepper ?? new Uint8Array(32);
  const searchableFields = [
    'location',
    'description',
    'triggers',
    'medications',
    'activities',
    'mood',
    'weather',
    'notes',
  ] as const;

  function tokenizeField(field: string, value: unknown): Promise<string> {
    return tokenizeFieldValue(value, pepper);
  }

  async function indexRecord(rowKey: string, data: Record<string, unknown>): Promise<void> {
    await backend.removeTokensForRow(rowKey);

    const entries: Array<{ field: string; token: string; rowKey: string }> = [];
    for (const field of searchableFields) {
      const raw = data[field];
      if (raw === undefined || raw === null) continue;
      const normalized = normalizeFieldValue(raw);
      if (!normalized) continue;
      const token = await tokenizeField(field, normalized);
      entries.push({ field, token, rowKey });
    }

    await backend.batchUpsert(
      entries.map((entry) => ({
        field: entry.field as BlindIndexEntry['field'],
        token: entry.token,
        rowKey: entry.rowKey,
        createdAt: new Date().toISOString(),
      }))
    );
  }

  async function search(field: BlindIndexEntry['field'], value: string): Promise<string[]> {
    const normalized = normalizeFieldValue(value);
    if (!normalized) return [];
    const token = await tokenizeField(field, normalized);
    const matches = await backend.searchTokens(field, token);
    return matches.map((match: { rowKey: string }) => match.rowKey);
  }

  async function removeRecord(rowKey: string): Promise<void> {
    await backend.removeTokensForRow(rowKey);
  }

  async function clear(): Promise<void> {
    await backend.clearAll();
  }

  return {
    indexRecord,
    search,
    removeRecord,
    clear,
  };
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBlindIndexEngine } from './blind-index';

interface MemoryBackend {
  entries: Map<string, Array<{ field: string; token: string; rowKey: string }>>;
}

function createMemoryBackend(): MemoryBackend {
  return { entries: new Map() };
}

function createBackend(memory: MemoryBackend): any {
  return {
    init: vi.fn(async () => {}),
    upsertToken: vi.fn(async (entry: any) => {
      const { field, token, rowKey } = entry;
      const list = memory.entries.get(field) ?? [];
      const idx = list.findIndex((e: any) => e.token === token && e.rowKey === rowKey);
      if (idx >= 0) list[idx] = { field, token, rowKey };
      else list.push({ field, token, rowKey });
      memory.entries.set(field, list);
    }),
    batchUpsert: vi.fn(async (entries: any[]) => {
      for (const entry of entries) {
        const { field, token, rowKey } = entry;
        const list = memory.entries.get(field) ?? [];
        const idx = list.findIndex((e: any) => e.token === token && e.rowKey === rowKey);
        if (idx >= 0) list[idx] = { field, token, rowKey };
        else list.push({ field, token, rowKey });
        memory.entries.set(field, list);
      }
    }),
    searchTokens: vi.fn(async (field: string, token: string) => {
      const list = memory.entries.get(field) ?? [];
      return list.filter((e: any) => e.token === token).map((e: any) => ({ rowKey: e.rowKey, token: e.token }));
    }),
    removeTokensForRow: vi.fn(async (rowKey: string) => {
      for (const [field, list] of Array.from(memory.entries.entries())) {
        const filtered = list.filter((e: any) => e.rowKey !== rowKey);
        if (filtered.length > 0) memory.entries.set(field, filtered);
        else memory.entries.delete(field);
      }
    }),
    clearField: vi.fn(async () => {}),
    clearAll: vi.fn(async () => { memory.entries.clear(); }),
  };
}

describe('createBlindIndexEngine', () => {
  let backend: MemoryBackend;
  let api: ReturnType<typeof createBlindIndexEngine>;

  beforeEach(() => {
    backend = createMemoryBackend();
    api = createBlindIndexEngine(createBackend(backend));
  });

  it('indexes record into searchable tokens', async () => {
    await api.indexRecord('row-1', { location: 'lower back', description: 'sharp pain', mood: 'anxious' });
    expect(backend.entries.size).toBeGreaterThanOrEqual(3);
    for (const [, list] of Array.from(backend.entries.entries())) {
      for (const entry of list) {
        expect(entry.rowKey).toBe('row-1');
        expect(typeof entry.token).toBe('string');
        expect(entry.token.length).toBe(64);
      }
    }
  });

  it('search returns matching rowKeys', async () => {
    await api.indexRecord('row-42', { location: 'neck', description: 'stiffness' });
    const results = await api.search('location', 'neck');
    expect(results).toEqual(['row-42']);
  });

  it('search returns empty for non-matching value', async () => {
    await api.indexRecord('row-42', { location: 'neck' });
    const results = await api.search('location', 'shoulder');
    expect(results).toEqual([]);
  });

  it('re-indexing replaces old tokens', async () => {
    await api.indexRecord('row-5', { location: 'head' });
    const before = backend.entries.get('location')?.[0]?.token;
    await api.indexRecord('row-5', { location: 'shoulder' });
    const after = backend.entries.get('location')?.[0]?.token;
    expect(backend.entries.get('location')).toHaveLength(1);
    expect(after).toBeDefined();
    expect(before).toBeDefined();
    expect(after).not.toBe(before);
  });
});

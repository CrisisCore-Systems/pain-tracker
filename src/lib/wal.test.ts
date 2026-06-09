import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWalEngine, WAL_STAGE } from './wal';

function createStubWalStore() {
  const records = new Map<string, any>();
  return {
    append: vi.fn(async (intent: any) => { records.set(intent.id, { ...intent }); }),
    markStage: vi.fn(async (id: string, stage: string) => {
      const rec = records.get(id);
      if (rec) rec.stage = stage;
    }),
    getPending: vi.fn(async () => {
      return [...records.values()].filter(r => r.stage === WAL_STAGE.PENDING || r.stage === WAL_STAGE.PROCESSING);
    }),
    remove: vi.fn(async (id: string) => { records.delete(id); }),
    clear: vi.fn(async () => { records.clear(); }),
  };
}

describe('createWalEngine', () => {
  let store: ReturnType<typeof createStubWalStore>;
  let engine: Awaited<ReturnType<typeof createWalEngine>>;

  beforeEach(async () => {
    store = createStubWalStore();
    engine = await createWalEngine({
      offlineStorageService: {
        storeData: vi.fn(async () => 1),
        updateData: vi.fn(async () => {}),
        deleteData: vi.fn(async () => {}),
      },
      walStore: store,
    });
  });

  it('appends PENDING intent then removes it on success', async () => {
    await engine.runProtected({ mutation: 'storeData', store: 'offline-data', payload: { pain_level: 3 } });
    expect(store.append).toHaveBeenCalledTimes(1);
    const appended = store.append.mock.calls[0][0];
    expect(appended.stage).toBe(WAL_STAGE.PENDING);
    expect(store.remove).toHaveBeenCalledTimes(1);
    expect(store.remove).toHaveBeenCalledWith(appended.id);
  });

  it('marks STAGE_PROCESSING and STAGE_COMPLETE on success', async () => {
    await engine.runProtected({ mutation: 'storeData', store: 'offline-data', payload: { pain_level: 3 } });
    const id = store.append.mock.calls[0][0].id;
    const markCalls = store.markStage.mock.calls.map(c => c[1]);
    expect(markCalls).toContain(WAL_STAGE.PROCESSING);
    expect(markCalls).toContain(WAL_STAGE.COMPLETE);
  });

  it('marks ROLLBACK on failure', async () => {
    const backend = {
      storeData: vi.fn(async () => { throw new Error('disk full'); }),
      updateData: vi.fn(async () => {}),
      deleteData: vi.fn(async () => {}),
    };
    const store2 = createStubWalStore();
    const failingEngine = await createWalEngine({ offlineStorageService: backend, walStore: store2 });
    await expect(failingEngine.runProtected({ mutation: 'storeData', store: 'offline-data', payload: { pain_level: 3 } })).rejects.toThrow('disk full');
    const id = store2.append.mock.calls[0][0].id;
    expect(store2.markStage).toHaveBeenCalledWith(id, WAL_STAGE.ROLLBACK);
  });

  it('reconciles PENDING entries by replaying and pruning them', async () => {
    store.append.mockClear();
    store.markStage.mockClear();
    store.remove.mockClear();
    store.getPending.mockResolvedValue([
      { id: 'w1', stage: WAL_STAGE.PENDING, mutation: 'storeData', store: 'offline-data', payload: { pain_level: 4 } },
      { id: 'w2', stage: WAL_STAGE.PROCESSING, mutation: 'updateData', rowId: 10, payload: { pain_level: 5 } },
    ]);
    const backend = {
      storeData: vi.fn(async (_s: string, p: any) => p.rowId ?? 1),
      updateData: vi.fn(async () => {}),
      deleteData: vi.fn(async () => {}),
    };
    const reconciliationEngine = await createWalEngine({ offlineStorageService: backend, walStore: store });
    const result = await reconciliationEngine.reconcile();
    expect(result.recovered).toBe(2);
  });
});

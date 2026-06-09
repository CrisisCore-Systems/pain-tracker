export const WAL_STAGE = {
  PENDING: 'STAGE_PENDING',
  PROCESSING: 'STAGE_PROCESSING',
  COMPLETE: 'STAGE_COMPLETE',
  ROLLBACK: 'STAGE_ROLLBACK',
} as const;

export type WalStage = (typeof WAL_STAGE)[keyof typeof WAL_STAGE];

export interface WalIntent {
  id: string;
  stage: WalStage;
  mutation: 'storeData' | 'updateData' | 'deleteData';
  store: string;
  rowId?: number;
  entryKey?: string;
  payload?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface WalStore {
  append(intent: WalIntent): Promise<void>;
  markStage(id: string, stage: WalStage): Promise<void>;
  getPending(): Promise<WalIntent[]>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

export interface OfflineStorageBackend {
  storeData(storeName: string, data: unknown): Promise<number>;
  updateData(id: number, data: unknown): Promise<void>;
  deleteData(id: number): Promise<void>;
  init?(): Promise<void>;
}

export interface ReconcileResult {
  recovered: number;
  pruned: number;
  failed: number;
}

export async function createWalEngine(opts: {
  offlineStorageService: OfflineStorageBackend;
  walStore: WalStore;
}) {
  const wal = opts.walStore;
  const storage = opts.offlineStorageService;

  await wal.clear();

  return {
    async init() {},
    async runProtected(call: {
      mutation: 'storeData' | 'updateData' | 'deleteData';
      store: string;
      rowId?: number;
      payload?: unknown;
    }) {
      const id = `wal_${Date.now()}`;
      await wal.append({
        id,
        stage: WAL_STAGE.PENDING,
        mutation: call.mutation,
        store: call.store,
        rowId: call.rowId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      try {
        await wal.markStage(id, WAL_STAGE.PROCESSING);
        if (call.mutation === 'storeData') await storage.storeData(call.store, call.payload);
        else if (call.mutation === 'updateData') await storage.updateData(call.rowId!, call.payload);
        else if (call.mutation === 'deleteData') await storage.deleteData(call.rowId!);
        await wal.markStage(id, WAL_STAGE.COMPLETE);
        await wal.remove(id);
      } catch (e) {
        await wal.markStage(id, WAL_STAGE.ROLLBACK);
        throw e;
      }
    },
    async reconcile(): Promise<ReconcileResult> {
      const pending = await wal.getPending();
      let recovered = 0;
      let pruned = 0;
      let failed = 0;
      for (const intent of pending) {
        try {
          if (intent.stage === WAL_STAGE.PROCESSING || intent.stage === WAL_STAGE.PENDING) {
            const core =
              intent.mutation === 'storeData'
                ? storage.storeData(intent.store, intent.payload)
                : intent.mutation === 'updateData'
                ? storage.updateData(intent.rowId!, intent.payload)
                : intent.mutation === 'deleteData'
                ? storage.deleteData(intent.rowId!)
                : Promise.resolve();

            await core;
            await wal.remove(intent.id);
            recovered++;
          } else {
            await wal.remove(intent.id);
            pruned++;
          }
        } catch (e) {
          failed++;
        }
      }
      return { recovered, pruned, failed };
    },
    async clear() {
      await wal.clear();
    },
  };
}

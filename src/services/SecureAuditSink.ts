export type { AuditEvent } from './AuditLogger';
import { type AuditEvent } from './AuditLogger';

/**
 * Interface for a persistent sink that stores audit events.
 */
export interface AuditSink {
  /**
   * Appends an event to the sink.
   * @returns The event with a cryptographic signature appended.
   */
  append(event: Omit<AuditEvent, 'signature'>): Promise<AuditEvent>;
  shutdown?(): Promise<void>;
}

export type AuditSinkState = 'healthy' | 'degraded';

export type AuditSinkDegradedReasonCode =
  | 'INDEXEDDB_UNAVAILABLE'
  | 'INIT_OPEN_FAILED'
  | 'INIT_LOCKOUT'
  | 'SIGNING_KEY_UNAVAILABLE'
  | 'QUOTA_RECOVERY_FAILED'
  | 'WRITE_FAILED'
  | 'UNKNOWN';

export type AuditSinkDegradedEventDetail = {
  reasonCode: AuditSinkDegradedReasonCode;
  at: string;
  message: string;
};

export type AuditSinkStatus = {
  state: AuditSinkState;
  lastFailureAt: string | null;
  lastError: string | null;
  lastReasonCode: AuditSinkDegradedReasonCode | null;
};

// In-Memory implementation for tests/Node environment to satisfy existing tests
// Uses a simple signature scheme compatible with the test expectations (mock-like)
export class InMemoryAuditSink implements AuditSink {
  private readonly events: AuditEvent[] = [];
  private readonly auditKey: string;

  constructor(auditKey: string) {
    this.auditKey = auditKey;
  }

  async append(event: Omit<AuditEvent, 'signature'>): Promise<AuditEvent> {
    const signature = `mock-sig-${this.events.length}-k${this.auditKey.length}`;
    const signed: AuditEvent = { ...event, signature };
    this.events.push(signed);
    return signed;
  }

  getEvents(): AuditEvent[] {
    return [...this.events];
  }

  async shutdown(): Promise<void> {
    // No external resources in memory sink.
  }
}

/**
 * Browser-native Audit Sink using IndexedDB and Web Crypto API.
 * 
 * Features:
 * - Persistent storage in 'pain-tracker-audit' IndexedDB
 * - HMAC-SHA256 signing of all events using a locally generated/stored key
 * - Auto-rotation of keys (simplified for this implementation to one key for now)
 * - Offline-capable
 */
export class IndexedDBAuditSink implements AuditSink {
  private static readonly INIT_RETRY_COOLDOWN_MS = 3_000;
  private static readonly INIT_FAILURES_BEFORE_COOLDOWN = 3;
  private static readonly PRUNE_FRACTION = 0.1;
  private static readonly MIN_PRUNE_COUNT = 1;

  private readonly dbName = 'pain-tracker-audit';
  private readonly dbVersion = 1;
  private readonly storeName = 'audit_events';
  private readonly keyStoreName = 'audit_keys';
  private dbPromise: Promise<IDBDatabase> | null = null;
  private hmacKey: CryptoKey | null = null;
  private status: AuditSinkStatus = {
    state: 'healthy',
    lastFailureAt: null,
    lastError: null,
    lastReasonCode: null,
  };
  private initFailureCount = 0;
  private nextInitRetryAt = 0;

  private ensureInit(): Promise<void> {
    const now = Date.now();
    if (now < this.nextInitRetryAt) {
      throw new Error('AUDIT_SINK_RETRY_COOLDOWN');
    }

    this.dbPromise ??= this.openDB();
    return this.dbPromise
      .then(async () => {
        if (!this.hmacKey) {
          await this.getOrGenerateKey();
        }
      })
      .catch(error => {
        this.handleInitFailure(error);
        throw error;
      });
  }

  private handleInitFailure(error: unknown): void {
    this.dbPromise = null;
    this.hmacKey = null;
    this.initFailureCount += 1;

    if (this.initFailureCount >= IndexedDBAuditSink.INIT_FAILURES_BEFORE_COOLDOWN) {
      this.nextInitRetryAt = Date.now() + IndexedDBAuditSink.INIT_RETRY_COOLDOWN_MS;
    }
  }

  private toError(error: unknown): Error {
    if (error instanceof Error) return error;
    return new Error(typeof error === 'string' ? error : 'Unknown IndexedDB error');
  }

  getStatus(): AuditSinkStatus {
    return { ...this.status };
  }

  private classifyDegradedReasonCode(error: unknown): AuditSinkDegradedReasonCode {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('AUDIT_SINK_RETRY_COOLDOWN')) {
      return 'INIT_LOCKOUT';
    }

    if (message.includes('AUDIT_SINK_QUOTA_RECOVERY_FAILED')) {
      return 'QUOTA_RECOVERY_FAILED';
    }

    if (this.isQuotaError(error)) {
      return 'QUOTA_RECOVERY_FAILED';
    }

    if (/indexeddb\s+not\s+supported/i.test(message)) {
      return 'INDEXEDDB_UNAVAILABLE';
    }

    if (/webcrypto\s+not\s+available|signing\s+key\s+unavailable/i.test(message)) {
      return 'SIGNING_KEY_UNAVAILABLE';
    }

    if (this.initFailureCount > 0) {
      return 'INIT_OPEN_FAILED';
    }

    return 'WRITE_FAILED';
  }

  private reasonCodeMessage(reasonCode: AuditSinkDegradedReasonCode): string {
    switch (reasonCode) {
      case 'INDEXEDDB_UNAVAILABLE':
        return 'IndexedDB storage is unavailable on this device/session.';
      case 'INIT_OPEN_FAILED':
        return 'Audit storage could not be opened right now.';
      case 'INIT_LOCKOUT':
        return 'Audit storage is cooling down before the next retry.';
      case 'SIGNING_KEY_UNAVAILABLE':
        return 'Audit signing key is currently unavailable.';
      case 'QUOTA_RECOVERY_FAILED':
        return 'Audit storage is full and automatic recovery did not succeed.';
      case 'WRITE_FAILED':
        return 'Audit event could not be written to secure storage.';
      default:
        return 'Audit sink degraded due to an unknown persistence error.';
    }
  }

  private markDegraded(
    error: unknown,
    reasonCode: AuditSinkDegradedReasonCode = this.classifyDegradedReasonCode(error)
  ): void {
    const message = error instanceof Error ? error.message : String(error);
    const now = new Date().toISOString();
    this.status = {
      state: 'degraded',
      lastFailureAt: now,
      lastError: message,
      lastReasonCode: reasonCode,
    };

    if (globalThis.window !== undefined) {
      globalThis.dispatchEvent(
        new CustomEvent('audit-sink-degraded', {
          detail: {
            reasonCode,
            at: now,
            message: this.reasonCodeMessage(reasonCode),
          },
        })
      );
    }
  }

  private markHealthy(): void {
    this.initFailureCount = 0;
    this.nextInitRetryAt = 0;

    if (this.status.state === 'healthy') return;
    this.status = {
      state: 'healthy',
      lastFailureAt: this.status.lastFailureAt,
      lastError: this.status.lastError,
      lastReasonCode: this.status.lastReasonCode,
    };

    if (globalThis.window !== undefined) {
      globalThis.dispatchEvent(new CustomEvent('audit-sink-recovered'));
    }
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
          if (globalThis.window === undefined || !globalThis.indexedDB) {
          // Fallback for SSR/Test enviroments where indexedDB might be missing
           reject(new Error('IndexedDB not supported'));
           return;
      }

        const request = globalThis.indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = () => reject(this.toError(request.error));
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
            // Auto-increment ID, index by timestamp
            const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
            store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains(this.keyStoreName)) {
            db.createObjectStore(this.keyStoreName, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
    });
  }

  private async getOrGenerateKey(): Promise<void> {
     // Retrieve or create HMAC key
     const db = await this.dbPromise!;
     
     // Try to get key
     const storedKey = await this.idbGet(db, this.keyStoreName, 'active_hmac_key');
     
     if (storedKey?.key) {
         this.hmacKey = storedKey.key;
       this.markHealthy();
         return;
     }

     if (!globalThis.crypto?.subtle) {
       throw new Error('WebCrypto not available for audit signing');
     }

     // Generate new key
    const key = await globalThis.crypto.subtle.generateKey(
        {
            name: "HMAC",
            hash: { name: "SHA-256" }
        },
        false, // not extractable
        ["sign", "verify"]
     );

     this.hmacKey = key;
     
     // Store it
     await this.idbPut(db, this.keyStoreName, { id: 'active_hmac_key', created: Date.now(), key });
      this.markHealthy();
  }

  // Helper for signing
  private async signData(data: string): Promise<string> {
      if (!this.hmacKey) await this.getOrGenerateKey();
      if (!this.hmacKey) {
        throw new Error('Audit signing key unavailable');
      }

      const enc = new TextEncoder();
        const signature = await globalThis.crypto.subtle.sign(
          "HMAC",
          this.hmacKey,
          enc.encode(data)
      );
      
      // Convert ArrayBuffer to Base64 string
        const b = String.fromCodePoint(...new Uint8Array(signature));
      return btoa(b);
  }

  async append(event: Omit<AuditEvent, 'signature'>): Promise<AuditEvent> {
      try {
        await this.ensureInit();
        const db = await this.dbPromise!; // valid or throws

        // Serialize event parts to sign
        // We sign a canonical string representation
        const payloadToSign = `${event.timestamp}|${event.eventType}|${event.userId || ''}|${JSON.stringify(event.details || {})}`;
        const signature = await this.signData(payloadToSign);
        
        // Store in IDB
        // We wrap it to store signature
        const storedOb = {
            ...event,
            signature,
            _synced: false
        } as unknown as AuditEvent; 

        await this.idbPutWithQuotaRecovery(db, storedOb);
        this.markHealthy();

        return storedOb;
      } catch (e) {
          const reasonCode = this.classifyDegradedReasonCode(e);
          this.markDegraded(e, reasonCode);
          console.error('Audit Log Failed:', reasonCode);
          throw new Error('AUDIT_SINK_DEGRADED');
      }
  }

  async shutdown(): Promise<void> {
    let db: IDBDatabase | null = null;

    if (this.dbPromise) {
      try {
        db = await this.dbPromise;
      } catch {
        // best effort: if init failed there may be no open handle to close
      }
    }

    if (db) {
      try {
        db.close();
      } catch {
        // ignore close failures during teardown
      }
    }

    this.dbPromise = null;
    this.hmacKey = null;
  }

  private isQuotaError(error: unknown): boolean {
    if (error instanceof DOMException) {
      return (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      );
    }

    if (error instanceof Error) {
      return /quota|storage\s+full|space/i.test(error.message);
    }

    return false;
  }

  private async idbPutWithQuotaRecovery(db: IDBDatabase, value: unknown): Promise<void> {
    try {
      await this.idbPut(db, this.storeName, value);
      return;
    } catch (error) {
      if (!this.isQuotaError(error)) {
        throw error;
      }
    }

    const prunedCount = await this.pruneOldestEntries(
      db,
      IndexedDBAuditSink.PRUNE_FRACTION,
      IndexedDBAuditSink.MIN_PRUNE_COUNT
    );

    if (prunedCount <= 0) {
      throw new Error('AUDIT_SINK_QUOTA_RECOVERY_FAILED');
    }

    await this.idbPut(db, this.storeName, value);
  }

  private idbCount(db: IDBDatabase, storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(this.toError(request.error));
    });
  }

  private idbDeleteMany(db: IDBDatabase, storeName: string, keys: Array<string | number>): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      for (const key of keys) {
        store.delete(key);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(this.toError(transaction.error));
      transaction.onabort = () => reject(this.toError(transaction.error));
    });
  }

  private idbGetOldestKeysByTimestamp(
    db: IDBDatabase,
    storeName: string,
    limit: number
  ): Promise<Array<string | number>> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('timestamp');
      const keys: Array<string | number> = [];

      const request = index.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor || keys.length >= limit) {
          resolve(keys);
          return;
        }

        keys.push(cursor.primaryKey as string | number);
        cursor.continue();
      };

      request.onerror = () => reject(this.toError(request.error));
    });
  }

  private async pruneOldestEntries(
    db: IDBDatabase,
    fraction: number,
    minCount: number
  ): Promise<number> {
    const total = await this.idbCount(db, this.storeName);
    if (total <= 0) return 0;

    const targetDeleteCount = Math.max(minCount, Math.ceil(total * fraction));
    const oldestKeys = await this.idbGetOldestKeysByTimestamp(db, this.storeName, targetDeleteCount);
    if (oldestKeys.length === 0) return 0;

    await this.idbDeleteMany(db, this.storeName, oldestKeys);
    return oldestKeys.length;
  }

  // Promisified IDB Helpers
  private idbGet(db: IDBDatabase, storeName: string, key: string | number): Promise<any> {
      return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(key);
          request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(this.toError(request.error));
      });
  }

  private idbPut(db: IDBDatabase, storeName: string, value: unknown): Promise<void> {
     return new Promise((resolve, reject) => {
         const transaction = db.transaction(storeName, 'readwrite');
         const store = transaction.objectStore(storeName);
         const request = store.put(value);
         request.onsuccess = () => resolve();
         request.onerror = () => reject(this.toError(request.error));
     });
  }
}

// Singleton instance
export const secureAuditSink = new IndexedDBAuditSink();

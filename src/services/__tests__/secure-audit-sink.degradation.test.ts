import { describe, expect, it, vi } from 'vitest';
import { IndexedDBAuditSink } from '../SecureAuditSink';

describe('IndexedDBAuditSink degradation state', () => {
  it('marks sink as degraded and dispatches event on append failure', async () => {
    const sink = new IndexedDBAuditSink();

    const openDbSpy = vi
      .spyOn(sink as unknown as { openDB: () => Promise<IDBDatabase> }, 'openDB')
      .mockRejectedValueOnce(new Error('idb unavailable'));

    const eventSpy = vi.fn();
    globalThis.addEventListener('audit-sink-degraded', eventSpy);

    await expect(
      sink.append({
        timestamp: new Date().toISOString(),
        eventType: 'test_event',
        details: { reason: 'test' },
      })
    ).rejects.toThrow('AUDIT_SINK_DEGRADED');

    const status = sink.getStatus();
    expect(status.state).toBe('degraded');
    expect(status.lastError).toContain('idb unavailable');
    expect(status.lastReasonCode).toBe('INIT_OPEN_FAILED');
    expect(eventSpy).toHaveBeenCalled();

    const degradedEvent = eventSpy.mock.calls[0]?.[0] as CustomEvent<{
      reasonCode?: string;
      message?: string;
    }>;
    expect(degradedEvent.detail?.reasonCode).toBe('INIT_OPEN_FAILED');
    expect(degradedEvent.detail?.message).toContain('Audit storage could not be opened');

    globalThis.removeEventListener('audit-sink-degraded', eventSpy);
    openDbSpy.mockRestore();
  });

  it('retries openDB after a failed initialization attempt', async () => {
    const sink = new IndexedDBAuditSink();

    const openDbSpy = vi
      .spyOn(sink as unknown as { openDB: () => Promise<IDBDatabase> }, 'openDB')
      .mockRejectedValue(new Error('temporary lock'));

    await expect(
      sink.append({
        timestamp: new Date().toISOString(),
        eventType: 'test_event',
        details: { attempt: 1 },
      })
    ).rejects.toThrow('AUDIT_SINK_DEGRADED');

    await expect(
      sink.append({
        timestamp: new Date().toISOString(),
        eventType: 'test_event',
        details: { attempt: 2 },
      })
    ).rejects.toThrow('AUDIT_SINK_DEGRADED');

    expect(openDbSpy).toHaveBeenCalledTimes(2);
    openDbSpy.mockRestore();
  });

  it('emits INIT_LOCKOUT reason code when cooldown blocks init retries', async () => {
    const sink = new IndexedDBAuditSink();
    (sink as unknown as { nextInitRetryAt: number }).nextInitRetryAt = Date.now() + 10_000;

    const eventSpy = vi.fn();
    globalThis.addEventListener('audit-sink-degraded', eventSpy);

    await expect(
      sink.append({
        timestamp: new Date().toISOString(),
        eventType: 'test_event',
      })
    ).rejects.toThrow('AUDIT_SINK_DEGRADED');

    const status = sink.getStatus();
    expect(status.lastReasonCode).toBe('INIT_LOCKOUT');
    const degradedEvent = eventSpy.mock.calls[0]?.[0] as CustomEvent<{ reasonCode?: string }>;
    expect(degradedEvent.detail?.reasonCode).toBe('INIT_LOCKOUT');

    globalThis.removeEventListener('audit-sink-degraded', eventSpy);
  });

  it('attempts quota recovery by pruning oldest entries and retrying write', async () => {
    const sink = new IndexedDBAuditSink();

    const fakeDb = {} as IDBDatabase;
    (sink as unknown as { dbPromise: Promise<IDBDatabase> }).dbPromise = Promise.resolve(fakeDb);

    vi.spyOn(sink as unknown as { ensureInit: () => Promise<void> }, 'ensureInit').mockResolvedValue();
    vi.spyOn(sink as unknown as { signData: (input: string) => Promise<string> }, 'signData').mockResolvedValue('sig');
    vi.spyOn(
      sink as unknown as { pruneOldestEntries: (db: IDBDatabase, fraction: number, minCount: number) => Promise<number> },
      'pruneOldestEntries'
    ).mockResolvedValue(5);

    const putSpy = vi
      .spyOn(sink as unknown as { idbPut: (db: IDBDatabase, store: string, value: unknown) => Promise<void> }, 'idbPut')
      .mockRejectedValueOnce(new Error('QuotaExceededError: storage full'))
      .mockResolvedValueOnce();

    const result = await sink.append({
      timestamp: new Date().toISOString(),
      eventType: 'test_event',
      details: { mode: 'quota-recovery' },
    });

    expect(result.signature).toBe('sig');
    expect(putSpy).toHaveBeenCalledTimes(2);
  });

  it('emits QUOTA_RECOVERY_FAILED when pruning cannot recover write capacity', async () => {
    const sink = new IndexedDBAuditSink();

    const fakeDb = {} as IDBDatabase;
    (sink as unknown as { dbPromise: Promise<IDBDatabase> }).dbPromise = Promise.resolve(fakeDb);

    vi.spyOn(sink as unknown as { ensureInit: () => Promise<void> }, 'ensureInit').mockResolvedValue();
    vi.spyOn(sink as unknown as { signData: (input: string) => Promise<string> }, 'signData').mockResolvedValue('sig');
    vi.spyOn(
      sink as unknown as { pruneOldestEntries: (db: IDBDatabase, fraction: number, minCount: number) => Promise<number> },
      'pruneOldestEntries'
    ).mockResolvedValue(0);

    vi.spyOn(sink as unknown as { idbPut: (db: IDBDatabase, store: string, value: unknown) => Promise<void> }, 'idbPut')
      .mockRejectedValue(new Error('QuotaExceededError: storage full'));

    const eventSpy = vi.fn();
    globalThis.addEventListener('audit-sink-degraded', eventSpy);

    await expect(
      sink.append({
        timestamp: new Date().toISOString(),
        eventType: 'test_event',
        details: { mode: 'quota-fail' },
      })
    ).rejects.toThrow('AUDIT_SINK_DEGRADED');

    const status = sink.getStatus();
    expect(status.lastReasonCode).toBe('QUOTA_RECOVERY_FAILED');
    const degradedEvent = eventSpy.mock.calls[0]?.[0] as CustomEvent<{ reasonCode?: string }>;
    expect(degradedEvent.detail?.reasonCode).toBe('QUOTA_RECOVERY_FAILED');

    globalThis.removeEventListener('audit-sink-degraded', eventSpy);
  });

  it('shutdown closes db handle and clears in-memory references', async () => {
    const sink = new IndexedDBAuditSink();
    const close = vi.fn();

    (sink as unknown as { dbPromise: Promise<IDBDatabase> }).dbPromise = Promise.resolve({
      close,
    } as unknown as IDBDatabase);
    (sink as unknown as { hmacKey: CryptoKey | null }).hmacKey = {} as CryptoKey;

    await sink.shutdown();

    expect(close).toHaveBeenCalledTimes(1);
    expect((sink as unknown as { dbPromise: Promise<IDBDatabase> | null }).dbPromise).toBeNull();
    expect((sink as unknown as { hmacKey: CryptoKey | null }).hmacKey).toBeNull();
  });
});

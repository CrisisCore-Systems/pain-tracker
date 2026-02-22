import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('localUsageBootstrap', () => {
  beforeEach(() => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('does not record a session when local usage counters are disabled', async () => {
    const recordUsageSession = vi.fn();

    vi.doMock('../../utils/privacySettings', () => ({
      readPrivacySettings: () => ({ localUsageCountersEnabled: false }),
    }));

    vi.doMock('../localUsageMetrics', () => ({
      recordUsageSession,
    }));

    const { recordLocalUsageSessionIfEnabled } = await import('../localUsageBootstrap');

    await recordLocalUsageSessionIfEnabled();

    expect(recordUsageSession).not.toHaveBeenCalled();
  });

  it('records at most once per browser session when enabled', async () => {
    const recordUsageSession = vi.fn();

    vi.doMock('../../utils/privacySettings', () => ({
      readPrivacySettings: () => ({ localUsageCountersEnabled: true }),
    }));

    vi.doMock('../localUsageMetrics', () => ({
      recordUsageSession,
    }));

    const { recordLocalUsageSessionIfEnabled } = await import('../localUsageBootstrap');

    await recordLocalUsageSessionIfEnabled();
    await recordLocalUsageSessionIfEnabled();

    expect(recordUsageSession).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('pt:usage:session-recorded')).toBe('1');
  });

  it('falls back safely when sessionStorage.getItem throws', async () => {
    const recordUsageSession = vi.fn();

    vi.doMock('../../utils/privacySettings', () => ({
      readPrivacySettings: () => ({ localUsageCountersEnabled: true }),
    }));

    vi.doMock('../localUsageMetrics', () => ({
      recordUsageSession,
    }));

    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
    try {
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: {
          getItem: () => {
            throw new Error('blocked');
          },
          setItem: () => {
            throw new Error('blocked');
          },
        },
        configurable: true,
      });

      const { recordLocalUsageSessionIfEnabled } = await import('../localUsageBootstrap');

      await expect(recordLocalUsageSessionIfEnabled()).resolves.toBeUndefined();
      await expect(recordLocalUsageSessionIfEnabled()).resolves.toBeUndefined();

      expect(recordUsageSession).toHaveBeenCalledTimes(1);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, 'sessionStorage', originalDescriptor);
      } else {
        // Some environments may not have sessionStorage; remove our stub.
        delete (globalThis as unknown as { sessionStorage?: unknown }).sessionStorage;
      }
    }
  });
});

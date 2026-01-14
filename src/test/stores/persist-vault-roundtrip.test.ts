import { describe, it, expect, beforeEach } from 'vitest';
import { vaultService } from '../../services/VaultService';
import { offlineStorage } from '../../lib/offline-storage';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

type RemovableStorage = { removeItem?: (name: string) => Promise<void> };

describe('Persist vault-gated roundtrip', () => {
  const passphrase = 'correct horse battery staple';
  let originalStorage: unknown;

  beforeEach(async () => {
    localStorage.clear();

    originalStorage = usePainTrackerStore.persist.getOptions().storage;

    // Best-effort clear of offline settings row used by the persist adapter.
    try {
      await offlineStorage.init();
      const rows = await offlineStorage.getData('settings');
      const matching = rows.filter(
        r =>
          r.id !== undefined &&
          r.data &&
          typeof r.data === 'object' &&
          'key' in r.data &&
          (r.data as Record<string, unknown>).key === 'zustand:persist:pain-tracker-storage'
      );
      await Promise.allSettled(matching.map(r => offlineStorage.deleteData(r.id!)));
    } catch {
      // ignore
    }

    // Reset vault + store state.
    try {
      vaultService.clearAll();
    } catch {
      // ignore
    }

    // Reset in-memory store without triggering persistence writes.
    usePainTrackerStore.persist.setOptions({
      storage: {
        getItem: async () => null,
        setItem: async () => undefined,
        removeItem: async () => undefined,
      },
    });
    usePainTrackerStore.getState().clearAllData();
    usePainTrackerStore.persist.setOptions({ storage: originalStorage as never });

    await (originalStorage as unknown as RemovableStorage | undefined)?.removeItem?.('pain-tracker-storage');
  });

  it('persists while unlocked, does not hydrate while locked, hydrates after unlock', async () => {
    // Setup vault (unlocked)
    await vaultService.setupPassphrase(passphrase);
    expect(vaultService.isUnlocked()).toBe(true);

    // Write a mood entry; persistence should write an encrypted blob into IDB.
    usePainTrackerStore.getState().addMoodEntry({
      mood: 7,
      energy: 6,
      anxiety: 3,
      stress: 4,
      hopefulness: 6,
      selfEfficacy: 6,
      emotionalClarity: 5,
      emotionalRegulation: 6,
      context: 'roundtrip',
      triggers: [],
      copingStrategies: [],
      socialSupport: 'moderate',
      notes: 'persist roundtrip',
    });

    // Wait until the persist adapter has written to offlineStorage.
    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      const rows = await offlineStorage.getData('settings');
      const match = rows.find(
        r =>
          r.data &&
          typeof r.data === 'object' &&
          'key' in r.data &&
          (r.data as Record<string, unknown>).key === 'zustand:persist:pain-tracker-storage'
      );
      if (match && match.data && typeof match.data === 'object' && 'value' in match.data) break;
      await new Promise(r => setTimeout(r, 25));
    }

    // Simulate a new session: lock vault + clear in-memory store.
    vaultService.lock();
    expect(vaultService.isUnlocked()).toBe(false);

    usePainTrackerStore.persist.setOptions({
      storage: {
        getItem: async () => null,
        setItem: async () => undefined,
        removeItem: async () => undefined,
      },
    });
    usePainTrackerStore.getState().clearAllData();
    usePainTrackerStore.persist.setOptions({ storage: originalStorage as never });

    // Rehydrate while locked should not restore encrypted data.
    await usePainTrackerStore.persist.rehydrate();
    expect(usePainTrackerStore.getState().moodEntries.length).toBe(0);

    // Unlock and rehydrate should restore.
    await vaultService.unlock(passphrase);
    expect(vaultService.isUnlocked()).toBe(true);

    await usePainTrackerStore.persist.rehydrate();
    expect(usePainTrackerStore.getState().moodEntries.length).toBe(1);
    expect(usePainTrackerStore.getState().moodEntries[0].mood).toBe(7);
  }, 30000);
});

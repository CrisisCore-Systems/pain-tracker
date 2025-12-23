import { usePainTrackerStore } from '../stores/pain-tracker-store';

const ZUSTAND_PERSIST_KEY = 'pain-tracker-storage';
const LEGACY_RAW_PAIN_ENTRIES_KEY = 'pain_tracker_entries';

/**
 * Clears all user data persisted by the app.
 *
 * This is intentionally conservative:
 * - Clears in-memory state
 * - Clears the Zustand persist key
 * - Clears PWA caches + offline IndexedDB + all `secureStorage` (pt:*) keys via PWAManager
 * - Clears legacy raw localStorage key used by backward-compat reads
 */
export async function clearAllUserData(): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1) Clear in-memory state first (minimize plaintext lifetime)
  try {
    usePainTrackerStore.getState().clearAllData();
  } catch {
    // ignore
  }

  // 2) Clear Zustand persist storage (best-effort)
  try {
    // The persist middleware attaches a `persist` helper on the store function.
    (usePainTrackerStore as unknown as { persist?: { clearStorage?: () => void } }).persist?.clearStorage?.();
  } catch {
    // ignore
  }

  try {
    localStorage.removeItem(ZUSTAND_PERSIST_KEY);
  } catch {
    // ignore
  }

  // 3) Clear PWA/offline layers (caches + IndexedDB + pt:* keys)
  try {
    const { pwaManager } = await import('./pwa-utils');
    await pwaManager.clearPWAData();
  } catch {
    // ignore
  }

  // 4) Clear legacy raw key (non-namespaced) used for backward compatibility
  try {
    localStorage.removeItem(LEGACY_RAW_PAIN_ENTRIES_KEY);
  } catch {
    // ignore
  }
}

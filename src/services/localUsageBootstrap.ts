import { readPrivacySettings } from '../utils/privacySettings';

import { recordUsageSession } from './localUsageMetrics';

let recordedThisBoot = false;

function safeSessionGet(key: string): string | null {
  try {
    return (globalThis as typeof globalThis & { sessionStorage?: Storage }).sessionStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeSessionSet(key: string, val: string): void {
  try {
    (globalThis as typeof globalThis & { sessionStorage?: Storage }).sessionStorage?.setItem(key, val);
  } catch {
    // ignore
  }
}

// Local-only usage metrics (no network): record at most once per browser session.
// Guarded to avoid double-counting in React 18 StrictMode/dev remounts.
export async function recordLocalUsageSessionIfEnabled(): Promise<void> {
  try {
    const privacy = readPrivacySettings();
    if (!privacy.localUsageCountersEnabled) return;

    const key = 'pt:usage:session-recorded';

    // Prefer sessionStorage (per-browser-session guard). If it's unavailable/throws,
    // fall back to an in-memory guard so we still record once per boot.
    if (safeSessionGet(key) === '1') return;
    if (recordedThisBoot) return;

    safeSessionSet(key, '1');
    recordedThisBoot = true;
    await recordUsageSession();
  } catch {
    // ignore storage/IDB errors
  }
}

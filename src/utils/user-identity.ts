/**
 * Local-only user identity helper
 *
 * Generates and persists a stable, non-sensitive identifier for this browser profile.
 *
 * NOTE: This is NOT an authentication system. It exists to provide a consistent
 * local identifier for subscription state + local usage tracking.
 */

const STORAGE_KEY = 'pain-tracker:user-id';

function generateId(): string {
  // Prefer Web Crypto UUID where available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback: RFC4122-ish v4 UUID
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Per RFC 4122 section 4.4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function getLocalUserId(): string {
  if (typeof window === 'undefined') {
    // Non-browser environments (tests/build tooling). Return a deterministic-ish placeholder.
    return 'local-user';
  }

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const next = `user-${generateId()}`;
    window.localStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch {
    // If storage is unavailable (privacy mode), fall back to an in-memory id.
    return `user-${generateId()}`;
  }
}

export function clearLocalUserId(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

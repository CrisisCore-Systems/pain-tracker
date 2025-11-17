export interface PainEntry {
  id: string;
  intensity: number;
  location?: string;
  description?: string;
  timestamp: string;
}

function generateId(): string {
  // Prefer Web Crypto's randomUUID when available (Node 18+, modern browsers)
  try {
    if (typeof (globalThis as any).crypto?.randomUUID === 'function') {
      return (globalThis as any).crypto.randomUUID();
    }
  } catch {
    // Crypto API not available, fall through to fallback
  }

  // Fallback: timestamp + random
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function makePainEntry(overrides: Partial<PainEntry> = {}): PainEntry {
  const now = new Date();
  return {
    id: generateId(),
    intensity: 5,
    location: 'back',
    description: 'test',
    timestamp: now.toISOString(),
    ...overrides,
  };
}

export default makePainEntry;

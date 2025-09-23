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
    // @ts-ignore - crypto may be ambient in different runtimes
    if (typeof (globalThis as any).crypto?.randomUUID === 'function') {
      // @ts-ignore
      return (globalThis as any).crypto.randomUUID();
    }
  } catch {}

  // Fallback: timestamp + random
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
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

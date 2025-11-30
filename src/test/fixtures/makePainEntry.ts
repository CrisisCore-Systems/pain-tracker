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

/**
 * Generate a series of pain entries showing various patterns
 */
export function generatePainSeries(
  startDate: Date,
  days: number,
  pattern: 'improving' | 'worsening' | 'fluctuating' | 'stable' = 'improving'
): PainEntry[] {
  const entries: PainEntry[] = [];
  
  for (let i = 0; i < days; i++) {
    const timestamp = new Date(startDate.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000);
    let intensity: number;
    
    switch (pattern) {
      case 'improving':
        intensity = Math.max(1, Math.min(10, 8 - (i / days) * 6));
        break;
      case 'worsening':
        intensity = Math.max(1, Math.min(10, 2 + (i / days) * 6));
        break;
      case 'fluctuating':
        intensity = Math.max(1, Math.min(10, 5 + Math.sin(i / 2) * 3));
        break;
      case 'stable':
      default:
        intensity = 5;
    }
    
    entries.push(makePainEntry({
      timestamp: timestamp.toISOString(),
      intensity: Math.round(intensity),
      description: `Day ${i + 1} of ${pattern} pattern`,
    }));
  }
  
  return entries;
}

/**
 * Create diverse sample pain entries
 */
export const samplePainLocations = [
  'Lower Back',
  'Upper Back',
  'Neck',
  'Right Shoulder',
  'Left Shoulder',
  'Right Knee',
  'Left Knee',
  'Right Hip',
  'Left Hip',
  'Right Ankle',
  'Left Ankle',
  'Right Wrist',
  'Left Wrist',
  'Jaw',
  'Head',
];

export const samplePainDescriptions = [
  'Sharp pain with movement',
  'Dull ache, constant',
  'Throbbing pain',
  'Burning sensation',
  'Stabbing pain',
  'Tingling and numbness',
  'Shooting pain down leg',
  'Stiffness and limited range',
  'Deep aching pain',
  'Muscle spasms',
  'Pressure-like pain',
  'Electric shock sensations',
];

export default makePainEntry;

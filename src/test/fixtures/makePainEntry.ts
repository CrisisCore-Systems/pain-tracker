import { v4 as uuidv4 } from 'uuid';

export interface PainEntry {
  id: string;
  intensity: number;
  location?: string;
  description?: string;
  timestamp: string;
}

export function makePainEntry(overrides: Partial<PainEntry> = {}): PainEntry {
  const now = new Date();
  return {
    id: uuidv4(),
    intensity: 5,
    location: 'back',
    description: 'test',
    timestamp: now.toISOString(),
    ...overrides,
  };
}

export default makePainEntry;

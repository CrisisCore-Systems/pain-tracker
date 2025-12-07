import type { MoodEntry } from '../types/quantified-empathy';
import { toIsoString } from './date-utils';

export function makeMoodEntry(
  data: Partial<MoodEntry> & { timestamp?: string | Date; id?: number } = {}
): MoodEntry {
  const ts = toIsoString(data.timestamp) ?? data.timestamp;
  // Generate collision-resistant ID: timestamp * 1000 + random suffix (0-999)
  const id = data.id ?? (Date.now() * 1000 + Math.floor(Math.random() * 1000));
  return {
    id,
    timestamp: ts ?? new Date().toISOString(),
    mood: data.mood ?? 5,
    energy: data.energy ?? 5,
    anxiety: data.anxiety ?? 5,
    stress: data.stress ?? 5,
    hopefulness: data.hopefulness ?? 5,
    selfEfficacy: data.selfEfficacy ?? 5,
    emotionalClarity: data.emotionalClarity ?? 5,
    emotionalRegulation: data.emotionalRegulation ?? 5,
    context: data.context ?? '',
    triggers: data.triggers ?? [],
    copingStrategies: data.copingStrategies ?? [],
    socialSupport: data.socialSupport ?? 'none',
    notes: data.notes ?? '',
  };
}

export default makeMoodEntry;

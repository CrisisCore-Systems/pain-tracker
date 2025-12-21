import type { PainEntry } from './types';

export class EmotionalStateTracker {
  async addMoodEntry(_userId: string, _entry: unknown) { return _entry; }
  async calculateEmotionalStateMetrics(_userId: string, _painEntries: PainEntry[]) { return {}; }
}

export const emotionalStateTracker = new EmotionalStateTracker();

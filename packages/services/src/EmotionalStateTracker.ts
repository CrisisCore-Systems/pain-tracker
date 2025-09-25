import type { PainEntry } from '../../src/types';

export class EmotionalStateTracker {
  async addMoodEntry(_userId: string, _entry: any) { return _entry; }
  async calculateEmotionalStateMetrics(_userId: string, _painEntries: PainEntry[]) { return {}; }
}

export const emotionalStateTracker = new EmotionalStateTracker();

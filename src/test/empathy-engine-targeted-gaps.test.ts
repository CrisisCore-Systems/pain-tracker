import { describe, it, expect } from 'vitest';
import { empathyIntelligenceEngine } from '../services/EmpathyIntelligenceEngine';
import type { PainEntry } from '../types';
import type { MoodEntry } from '../types/quantified-empathy';

function makePainEntry(id: number, pain: number, timestampOffsetDays: number): PainEntry {
  const date = new Date();
  date.setDate(date.getDate() - timestampOffsetDays);
  return {
    id,
    timestamp: date.toISOString(),
    baselineData: { pain, locations: ['back'], symptoms: ['ache'] },
    functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
    medications: { current: [], changes: '', effectiveness: '' },
    treatments: { recent: [], effectiveness: '', planned: [] },
    qualityOfLife: { sleepQuality: 6, moodImpact: 4, socialImpact: [] },
    workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
    comparison: { worseningSince: '', newLimitations: [] },
    notes: 'pain trend test',
  };
}

function makeMoodEntry(_id: number, note: string, mood = 6): MoodEntry {
  return {
    timestamp: new Date(),
    mood,
    energy: 5,
    anxiety: 3,
    stress: 4,
    hopefulness: 6,
    selfEfficacy: 6,
    emotionalClarity: 6,
    emotionalRegulation: 5,
    context: 'test',
    triggers: [],
    copingStrategies: [],
    socialSupport: 'moderate',
    notes: note,
  };
}

describe('EmpathyIntelligenceEngine targeted gaps', () => {
  it('meaningfulness acceptance bonus and integrated wisdom paths', async () => {
    // Create pain entries where recent pain lower than earlier to boost acceptance bonus
    const painEntries: PainEntry[] = [
      // Earlier 7 days (higher pain)
      ...Array.from({ length: 7 }, (_, i) => makePainEntry(i + 1, 8, 14 - i)),
      // Recent 7 days (lower pain)
      ...Array.from({ length: 7 }, (_, i) => makePainEntry(i + 100, 2, 7 - i)),
    ];

    // Mood entries including insight + apply words for integrated wisdom and meaning/purpose words
    const moodEntries: MoodEntry[] = [
      makeMoodEntry(1, 'I learned and applied a new coping method and found purpose'),
      makeMoodEntry(2, 'I realized and practiced insight and applied meaning today'),
      makeMoodEntry(3, 'I understand and implemented and applied growth and purpose'),
      makeMoodEntry(4, 'Shared what I learned and applied to help someone'),
      makeMoodEntry(5, 'I practiced and applied and felt connection and meaning'),
      makeMoodEntry(6, 'I applied insight and practiced purpose'),
      makeMoodEntry(7, 'Implemented applied learning purpose meaning'),
    ];

    const advanced = await empathyIntelligenceEngine.calculateAdvancedEmpathyMetrics(
      'userX',
      painEntries,
      moodEntries
    );
    expect(advanced.humanizedMetrics.innerStrength).toBeGreaterThan(0);
    expect(advanced.humanizedMetrics.purposeClarity).toBeGreaterThan(0);
  });
});

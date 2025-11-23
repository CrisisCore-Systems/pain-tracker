import { describe, it, expect } from 'vitest';
import type { MoodEntry } from '../types/quantified-empathy';
import {
  categorizeWisdom,
  assessApplicability,
  extractWisdomInsights,
} from '../services/empathy/WisdomModule';

interface TestMoodEntry {
  notes: string;
  id: number;
  timestamp: string;
  emotionalClarity: number;
  emotionalRegulation: number;
  hopefulness: number;
  context: string;
  copingStrategies: string[];
  anxiety: number;
  socialSupport: 'none' | 'minimal' | 'moderate' | 'strong';
  mood: number;
  energy: number;
  stress: number;
  selfEfficacy: number;
  triggers: string[];
}
const mkMood = (notes: string): TestMoodEntry => ({
  notes,
  id: 1,
  timestamp: new Date().toISOString(),
  emotionalClarity: 6,
  emotionalRegulation: 6,
  hopefulness: 5,
  context: 'test',
  copingStrategies: [],
  anxiety: 0,
  socialSupport: 'none',
  mood: 5,
  energy: 5,
  stress: 5,
  selfEfficacy: 5,
  triggers: [] as string[],
});

describe('WisdomModule', () => {
  it('categorizes relational wisdom', () => {
    expect(categorizeWisdom('I learned about connection in relationships')).toBe('relational');
  });
  it('assesses applicability scaling', () => {
    expect(assessApplicability('I can and will improve')).toBeGreaterThan(40);
  });
  it('extracts wisdom insights', async () => {
    const insights = await extractWisdomInsights(
      'u',
      [],
      ([
        mkMood(
          'I realized something important and learned a deep lesson about growth and purpose in life'
        ),
      ] as unknown) as MoodEntry[]
    );
    expect(insights.length).toBe(1);
  });
});

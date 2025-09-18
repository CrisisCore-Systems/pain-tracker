import { describe, it, expect } from 'vitest';
import { EmpathyIntelligenceEngine } from '../services/EmpathyIntelligenceEngine';
import type { MoodEntry } from '../types/quantified-empathy';
import type { PainEntry } from '../types';

const engine = new EmpathyIntelligenceEngine({
  learningRate: 0.1,
  predictionHorizon: 7,
  personalizationDepth: 'moderate',
  culturalSensitivity: 'standard',
  interventionStyle: 'balanced',
  privacyLevel: 'standard'
});

function mood(note: string, overrides: Partial<MoodEntry> = {}): MoodEntry {
  const base: MoodEntry = {
    timestamp: new Date(),
    mood: 6,
    energy: 6,
    anxiety: 4,
    stress: 5,
    hopefulness: 6,
    selfEfficacy: 5,
    emotionalClarity: 6,
    emotionalRegulation: 6,
    context: 'test',
    triggers: [],
    copingStrategies: [],
    socialSupport: 'minimal',
    notes: note
  };
  return { ...base, ...overrides };
}

const pain: PainEntry = {
  id: 1,
  timestamp: new Date().toISOString(),
  baselineData: { pain: 5, locations: ['back'], symptoms: ['ache'] },
  functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
  medications: { current: [], changes: '', effectiveness: '' },
  treatments: { recent: [], effectiveness: '', planned: [] },
  qualityOfLife: { sleepQuality: 6, moodImpact: 4, socialImpact: [] },
  workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
  comparison: { worseningSince: '', newLimitations: [] },
  notes: 'baseline'
};

describe('Wisdom metric heuristics', () => {
  it('produces higher self-knowledge with introspective language', async () => {
    const moods = [
      mood('I realized I feel patterns emerging and I understand triggers'),
      mood('I learned today and I feel aware of my needs')
    ];
    const metrics = await engine.calculateAdvancedEmpathyMetrics('u1', [pain], moods);
    expect(metrics.humanizedMetrics.wisdomGained.insights.length).toBeGreaterThanOrEqual(0);
    // selfKnowledgeWisdom inside wisdomCategories
    expect(metrics.humanizedMetrics.wisdomGained.wisdomCategories.selfKnowledgeWisdom).toBeGreaterThan(50);
  });

  it('calculates wisdom growth rate based on increased insight density', async () => {
    const early = Array.from({length:3}, (_,i)=> mood('just a day', { timestamp: new Date(Date.now() - (10-i)*86400000) }));
    const later = Array.from({length:4}, (_,i)=> mood('I learned an insight about growth', { timestamp: new Date(Date.now() - (4-i)*86400000) }));
    const metrics = await engine.calculateAdvancedEmpathyMetrics('u2', [pain], [...early, ...later]);
    expect(metrics.humanizedMetrics.wisdomGained.wisdomGrowthRate).toBeGreaterThan(40);
  });
});

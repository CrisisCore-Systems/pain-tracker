import { describe, it, expect } from 'vitest';
import { EmpathyIntelligenceEngine } from '../services/EmpathyIntelligenceEngine';
import type { PainEntry } from '../types';
import type { MoodEntry } from '../types/quantified-empathy';

// Helper builders
function pain(id: number, painLevel: number, note: string): PainEntry {
  return {
    id,
    timestamp: new Date(Date.now() - id * 3600_000).toISOString(),
    baselineData: { pain: painLevel, locations: ['back'], symptoms: ['ache'] },
    functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
    medications: { current: [], changes: '', effectiveness: '' },
    treatments: { recent: [], effectiveness: '', planned: [] },
    qualityOfLife: { sleepQuality: 6, moodImpact: 4, socialImpact: [] },
    workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
    comparison: { worseningSince: '', newLimitations: [] },
    notes: note
  };
}

function mood(idx: number, note: string, overrides: Partial<MoodEntry> = {}): MoodEntry {
  const base: MoodEntry = {
    timestamp: new Date(Date.now() - idx * 3600_000),
    mood: 5 + (idx % 3),
    energy: 5,
    anxiety: 3 + (idx % 2),
    stress: 4,
    hopefulness: 6,
    selfEfficacy: 5,
    emotionalClarity: 6,
    emotionalRegulation: 6,
    context: 'test',
    triggers: [],
    copingStrategies: ['mindfulness', 'self-care'].slice(0, (idx % 2) + 1),
    socialSupport: idx % 2 === 0 ? 'moderate' : 'minimal',
    notes: note
  };
  return { ...base, ...overrides };
}

const engine = new EmpathyIntelligenceEngine({
  learningRate: 0.2,
  predictionHorizon: 14,
  personalizationDepth: 'deep',
  culturalSensitivity: 'enhanced',
  interventionStyle: 'adaptive',
  privacyLevel: 'enhanced'
});

// Generate representative dataset covering many heuristics
const pains: PainEntry[] = [
  pain(1, 7, 'acute flare after long day'),
  pain(2, 5, 'manageable with pacing'),
  pain(3, 3, 'mild improvement noticed'),
  pain(4, 6, 'spike but learned coping'),
  pain(5, 4, 'steady and meaningful progress')
];

const moods: MoodEntry[] = [
  mood(1, 'I learned to reframe and I feel hopeful after support from friend'),
  mood(2, 'Practiced perspective and noticed boundary maintained which felt empowering'),
  mood(3, 'Felt emotional connection and understood their perspective deeply'),
  mood(4, 'Applied insight and shared what I realized and helped someone'),
  mood(5, 'Grateful and meaning emerging; spiritual acceptance and growth'),
  mood(6, 'I noticed I am calmer and remembered progress; practiced compassion')
];

describe('EmpathyIntelligenceEngine integration', () => {
  it('produces holistic metrics, insights and recommendations', async () => {
    const metrics = await engine.calculateAdvancedEmpathyMetrics('user-int', pains, moods);
    expect(metrics.emotionalIntelligence.empathy).toBeGreaterThanOrEqual(0);
    expect(metrics.humanizedMetrics.wisdomGained.insights.length).toBeLessThanOrEqual(10);
    const insights = await engine.generateAdvancedInsights('user-int', metrics, { painEntries: pains, moodEntries: moods });
    expect(insights.length).toBeGreaterThan(0);
    const recs = await engine.generatePersonalizedRecommendations('user-int', metrics, insights);
    expect(recs.length).toBeGreaterThan(0);
    // Spot check some derived metrics boundaries
    expect(metrics.predictiveMetrics.burnoutRisk.currentRiskLevel).toBeGreaterThanOrEqual(0);
    expect(metrics.predictiveMetrics.burnoutRisk.currentRiskLevel).toBeLessThanOrEqual(100);
    expect(metrics.empathyIntelligence.empathyIQ).toBeLessThanOrEqual(200);
  });
});

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { PremiumAnalyticsDashboard } from '../PremiumAnalyticsDashboard';
import type { PainEntry } from '../../../types';

function makeEntry(overrides: Partial<PainEntry> = {}): PainEntry {
  const base: PainEntry = {
    id: `test-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    baselineData: {
      pain: 5,
      locations: [],
      symptoms: [],
    },
    functionalImpact: {
      limitedActivities: [],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [],
      changes: '',
      effectiveness: '',
    },
    treatments: {
      recent: [],
      effectiveness: '',
      planned: [],
    },
    qualityOfLife: {
      sleepQuality: 5,
      moodImpact: 5,
      socialImpact: [],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: [],
      workLimitations: [],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes: '',
    ...overrides,
  };

  // Deep-merge the couple nested objects we override frequently
  return {
    ...base,
    baselineData: {
      ...base.baselineData,
      ...(overrides.baselineData ?? {}),
    },
    qualityOfLife: {
      ...base.qualityOfLife,
      ...(overrides.qualityOfLife ?? {}),
    },
    functionalImpact: {
      ...base.functionalImpact,
      ...(overrides.functionalImpact ?? {}),
    },
  };
}

describe('PremiumAnalyticsDashboard patterns include extended fields', () => {
  it('shows relief methods, qualities, activities, stress/activity level, and weather correlations', async () => {
    const user = userEvent.setup();

    const now = Date.now();
    const entries: PainEntry[] = [
      makeEntry({
        timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        baselineData: { pain: 6, locations: ['Back'], symptoms: [] },
        reliefMethods: ['Heat'],
        quality: ['sharp'],
        activities: ['Walking'],
        stress: 7,
        activityLevel: 4,
        weather: '8°C, rain, 80% humidity',
      }),
      makeEntry({
        timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
        baselineData: { pain: 4, locations: ['Neck'], symptoms: [] },
        reliefMethods: ['Rest'],
        quality: ['dull'],
        activities: ['Stretching'],
        stress: 3,
        activityLevel: 6,
        weather: '18°C, clear, 45% humidity',
      }),
      makeEntry({
        timestamp: new Date(now).toISOString(),
        baselineData: { pain: 7, locations: ['Hip'], symptoms: [] },
        reliefMethods: ['Heat'],
        quality: ['burning'],
        activities: ['Walking'],
        stress: 8,
        activityLevel: 2,
        weather: '12°C, drizzle, 75% humidity',
      }),
    ];

    render(<PremiumAnalyticsDashboard entries={entries} />);

    const patternsTab = screen.getByRole('button', { name: /Pattern analysis/i });
    await user.click(patternsTab);

    expect(await screen.findByText(/Relief methods/i)).toBeInTheDocument();
    expect(screen.getByText(/Pain quality/i)).toBeInTheDocument();
    expect(screen.getByText(/^Activities$/i)).toBeInTheDocument();
    expect(screen.getByText(/Stress & activity level/i)).toBeInTheDocument();
    expect(screen.getByText(/Weather Correlations/i)).toBeInTheDocument();
  });
});

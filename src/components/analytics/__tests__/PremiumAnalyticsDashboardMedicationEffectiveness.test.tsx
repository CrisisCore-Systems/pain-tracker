import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
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

  return {
    ...base,
    baselineData: {
      ...base.baselineData,
      ...(overrides.baselineData ?? {}),
    },
    medications: {
      ...base.medications,
      ...(overrides.medications ?? {}),
    },
  };
}

describe('PremiumAnalyticsDashboard medication effectiveness display', () => {
  it('shows <1% instead of 0% for small but non-zero reduction (and works with unsorted entries)', () => {
    const now = Date.now();

    const medEntry = makeEntry({
      timestamp: new Date(now - 60 * 60 * 1000).toISOString(),
      baselineData: { pain: 5.0, locations: [], symptoms: [] },
      medications: {
        current: [{ name: 'Ibuprofen', dosage: '200mg', frequency: 'PRN', effectiveness: '' }],
        changes: '',
        effectiveness: '',
      },
    });

    const laterEntry = makeEntry({
      timestamp: new Date(now).toISOString(),
      baselineData: { pain: 4.96, locations: [], symptoms: [] },
      medications: {
        current: [],
        changes: '',
        effectiveness: '',
      },
    });

    // Deliberately unsorted: laterEntry first.
    render(<PremiumAnalyticsDashboard entries={[laterEntry, medEntry]} />);

    expect(screen.getByText(/Medication effectiveness/i)).toBeInTheDocument();
    expect(screen.getByText(/<1% effective/i)).toBeInTheDocument();
    expect(screen.queryByText(/0% effective/i)).not.toBeInTheDocument();
  });
});

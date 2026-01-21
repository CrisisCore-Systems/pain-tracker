import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { PainEntry } from '../../types';
import { InteractiveBodyMap } from './InteractiveBodyMap';

vi.mock('../../utils/usage-tracking', () => ({
  trackUsageEvent: vi.fn(),
  incrementSessionAction: vi.fn(),
}));

describe('InteractiveBodyMap (heatmap)', () => {
  const createMockEntry = (overrides: Partial<PainEntry> = {}): PainEntry => ({
    id: `entry-${Date.now()}-${Math.random()}`,
    timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
    baselineData: {
      pain: 6,
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
      sleepQuality: 0,
      moodImpact: 0,
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
  });

  it('maps non-body-map checklist labels (e.g., lumbar spine) to regions', () => {
    const entry = createMockEntry({
      baselineData: {
        pain: 7,
        locations: ['lumbar spine'],
        symptoms: [],
      },
    });

    render(<InteractiveBodyMap mode="heatmap" entries={[entry]} showAccessibilityFeatures={false} />);

    const status = screen.getByText(/with recorded pain/i, { selector: 'p' });
    expect(status.textContent).not.toMatch(/^0\s+region/);
  });

  it('uses entry.location when baselineData.locations is empty', () => {
    const entry = createMockEntry({
      baselineData: {
        pain: 5,
        locations: [],
        symptoms: [],
      },
      location: 'lower back',
    });

    render(<InteractiveBodyMap mode="heatmap" entries={[entry]} showAccessibilityFeatures={false} />);

    const status = screen.getByText(/with recorded pain/i, { selector: 'p' });
    expect(status.textContent).not.toMatch(/^0\s+region/);
  });
});

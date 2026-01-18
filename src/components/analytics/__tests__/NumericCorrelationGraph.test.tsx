import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { NumericCorrelationGraph } from '../NumericCorrelationGraph';
import { makePainEntry } from '../../../utils/pain-entry-factory';
import type { PainEntry } from '../../../types';

describe('NumericCorrelationGraph', () => {
  it('does not render when insufficient data', () => {
    const entries: PainEntry[] = [
      makePainEntry({
        baselineData: { pain: 5, locations: [], symptoms: [] },
        qualityOfLife: { sleepQuality: 5, moodImpact: 5, socialImpact: [] },
      }),
      makePainEntry({
        baselineData: { pain: 6, locations: [], symptoms: [] },
        qualityOfLife: { sleepQuality: 6, moodImpact: 4, socialImpact: [] },
      }),
    ];

    render(<NumericCorrelationGraph entries={entries} />);
    expect(screen.queryByText('Correlation Graph')).not.toBeInTheDocument();
  });

  it('renders a correlation graph when enough data exists', () => {
    const entries: PainEntry[] = Array.from({ length: 14 }, (_, i) =>
      makePainEntry({
        id: `e${i}`,
        timestamp: new Date(2025, 0, i + 1).toISOString(),
        baselineData: { pain: (i % 10) + 1, locations: [], symptoms: [] },
        qualityOfLife: { sleepQuality: i % 11, moodImpact: (10 - (i % 11)) as number, socialImpact: [] },
      })
    );

    render(<NumericCorrelationGraph entries={entries} />);

    expect(screen.getByText('Correlation Graph')).toBeInTheDocument();
    expect(screen.getByText(/Pain vs\./)).toBeInTheDocument();
    expect(screen.getByText(/r =/)).toBeInTheDocument();
    expect(screen.getByText(/n =/)).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle trend line')).toBeInTheDocument();
  });
});

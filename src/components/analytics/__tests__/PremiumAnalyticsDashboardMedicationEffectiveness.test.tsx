import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { PremiumAnalyticsDashboard } from '../PremiumAnalyticsDashboard';
import type { PainEntry } from '../../../types';
import { makePainEntry } from '../../../utils/pain-entry-factory';

describe('PremiumAnalyticsDashboard medication effectiveness display', () => {
  it('shows <0.1 points instead of 0.0 for small but non-zero reduction (and works with unsorted entries)', () => {
    const base = Date.UTC(2024, 1, 10, 12, 0, 0);
    const iso = (hoursFromBase: number) => new Date(base + hoursFromBase * 60 * 60 * 1000).toISOString();

    vi.useFakeTimers();
    vi.setSystemTime(new Date(base));

    const medEntry = makePainEntry({
      id: 'med-1',
      timestamp: iso(0),
      baselineData: { pain: 5.0, locations: [], symptoms: [] },
      medications: {
        current: [{ name: 'Ibuprofen', dosage: '200mg', frequency: 'PRN', effectiveness: '' }],
        changes: '',
        effectiveness: '',
      },
    });

    const laterEntry = makePainEntry({
      id: 'after-1',
      timestamp: iso(1),
      baselineData: { pain: 4.96, locations: [], symptoms: [] },
      medications: {
        current: [],
        changes: '',
        effectiveness: '',
      },
    });

    const earlierEntries: PainEntry[] = Array.from({ length: 12 }, (_, i) =>
      makePainEntry({
        id: `early-${i + 1}`,
        timestamp: iso(-48 - i),
        baselineData: { pain: 4 + (i % 4), locations: [], symptoms: [] },
        medications: { current: [], changes: '', effectiveness: '' },
      })
    );

    const laterEntries: PainEntry[] = Array.from({ length: 12 }, (_, i) =>
      makePainEntry({
        id: `late-${i + 1}`,
        timestamp: iso(48 + i),
        baselineData: { pain: 4 + ((i + 1) % 4), locations: [], symptoms: [] },
        medications: { current: [], changes: '', effectiveness: '' },
      })
    );

    try {
      // Deliberately unsorted: laterEntry first.
      render(<PremiumAnalyticsDashboard entries={[laterEntry, ...laterEntries, ...earlierEntries, medEntry]} />);

      expect(screen.getByText(/Observed relief after medication/i)).toBeInTheDocument();
      expect(screen.getByText(/Avg reduction:\s*<0\.1 points/i)).toBeInTheDocument();
      expect(screen.queryByText(/Avg reduction:\s*0\.0 points/i)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not attribute next-entry relief to each medication when multiple meds are logged together', () => {
    const base = Date.UTC(2024, 1, 10, 12, 0, 0);
    const iso = (hoursFromBase: number) =>
      new Date(base + hoursFromBase * 60 * 60 * 1000).toISOString();

    vi.useFakeTimers();
    vi.setSystemTime(new Date(base));

    const comboMedEntry = makePainEntry({
      id: 'med-combo-1',
      timestamp: iso(0),
      baselineData: { pain: 6.0, locations: [], symptoms: [] },
      medications: {
        current: [
          { name: 'Ibuprofen', dosage: '200mg', frequency: 'PRN', effectiveness: '' },
          { name: 'Acetaminophen', dosage: '500mg', frequency: 'PRN', effectiveness: '' },
        ],
        changes: '',
        effectiveness: '',
      },
    });

    const nextEntry = makePainEntry({
      id: 'after-combo-1',
      timestamp: iso(1),
      baselineData: { pain: 5.0, locations: [], symptoms: [] },
      medications: { current: [], changes: '', effectiveness: '' },
    });

    try {
      render(<PremiumAnalyticsDashboard entries={[comboMedEntry, nextEntry]} />);

      expect(screen.queryByText(/Observed relief after medication/i)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

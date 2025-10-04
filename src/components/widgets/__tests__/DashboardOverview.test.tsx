import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
// Mock PredictivePanel (lazy-loaded) so Suspense doesn't delay tests
vi.mock('../../PredictivePanel', () => ({
  default: () => <div data-testid="predictive-panel-mock">Predictive</div>
}));
// Mock Chart to avoid Chart.js rendering inside tests
vi.mock('../../design-system/components/Chart', () => ({
  default: (props: any) => <div data-testid="chart-mock">Chart</div>,
  PainTrendChart: (props: any) => <div data-testid="chart-mock">Chart</div>,
  SymptomFrequencyChart: (props: any) => <div data-testid="chart-mock">Chart</div>,
  PainDistributionChart: (props: any) => <div data-testid="chart-mock">Chart</div>,
}));
const mockGenerateDashboardAIInsights = vi.fn(() => [
  {
    id: 'mock-insight',
    title: 'Mocked insight',
    summary: 'This is a mocked insight summary.',
    tone: 'observation',
    confidence: 0.72,
    metricLabel: '7-day average',
    metricValue: '5.0/10',
  },
]);
vi.mock('../../../utils/pain-tracker/insights', () => ({
  generateDashboardAIInsights: () => mockGenerateDashboardAIInsights(),
}));

import { DashboardOverview } from '../DashboardOverview';
import type { PainEntry } from '../../../types';

function makeEntry(id: string, iso: string, pain: number) {
  return {
    id,
    timestamp: iso,
  baselineData: { pain, symptoms: [] },
  qualityOfLife: null,
  functionalImpact: null,
  medications: [],
  treatments: [],
  workImpact: null,
  metadata: {},
  comparison: null,
  notes: ''
  };
}

describe('DashboardOverview', () => {
  it('shows all-time total when allEntries provided', async () => {
    const today = new Date();
    const entries = [
      makeEntry('1', new Date(today.getTime() - 2 * 24 * 3600 * 1000).toISOString(), 3),
      makeEntry('2', new Date(today.getTime() - 1 * 24 * 3600 * 1000).toISOString(), 5)
    ];
    const allEntries = [...entries, makeEntry('3', new Date(today.getTime() - 30 * 24 * 3600 * 1000).toISOString(), 4)];

    render(<DashboardOverview entries={entries as unknown as PainEntry[]} allEntries={allEntries as unknown as PainEntry[]} />);
    await screen.findByTestId('predictive-panel-mock');

    const totalSection = screen.getByText('Total Entries').closest('div.space-y-1');
    expect(totalSection).toBeTruthy();
    const totalValue = within(totalSection as HTMLElement).getByText(
      (_content, node) => node?.tagName === 'P' && node.textContent?.trim() === '3'
    );
    expect(totalValue).toBeTruthy();
  });

  it('rounds average and weekly numbers to one decimal', async () => {
    const today = new Date();
    const entries = [
      makeEntry('1', today.toISOString(), 3),
      makeEntry('2', today.toISOString(), 4)
    ];

    render(<DashboardOverview entries={entries as unknown as PainEntry[]} allEntries={entries as unknown as PainEntry[]} />);
    await screen.findByTestId('predictive-panel-mock');

    // Average pain should be displayed with one decimal (3.5) inside the Average Pain card
    const avgSection = screen.getByText('Average Pain').closest('div.space-y-1');
    expect(avgSection).toBeTruthy();
    const avgValue = within(avgSection as HTMLElement).getByText(
      (_content, node) => node?.tagName === 'P' && node.textContent?.trim() === '3.5/10'
    );
    expect(avgValue).toBeTruthy();
  });

  it('counts today entries using local date match', async () => {
    const now = new Date();
    const isoNow = now.toISOString();
    const entries = [makeEntry('1', isoNow, 2), makeEntry('2', new Date(now.getTime() - 24 * 3600 * 1000).toISOString(), 2)];

    render(<DashboardOverview entries={entries as unknown as PainEntry[]} allEntries={entries as unknown as PainEntry[]} />);
    await screen.findByTestId('predictive-panel-mock');

    // Today's entries should be 1 (scoped within the card to avoid duplicates)
    const todaySection = screen.getByText("Today's Entries").closest('div.space-y-1');
    expect(todaySection).toBeTruthy();
    const todayValue = within(todaySection as HTMLElement).getByText(
      (_content, node) => node?.tagName === 'P' && node.textContent?.trim() === '1'
    );
    expect(todayValue).toBeTruthy();
  });

  it('renders AI insight highlights using generated insights', async () => {
    const today = new Date();
    const entries = [
      makeEntry('1', today.toISOString(), 6),
      makeEntry('2', new Date(today.getTime() - 2 * 24 * 3600 * 1000).toISOString(), 4),
    ];

    render(<DashboardOverview entries={entries as unknown as PainEntry[]} allEntries={entries as unknown as PainEntry[]} />);
    await screen.findByTestId('predictive-panel-mock');

    expect(await screen.findByText('AI insight highlights')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /mocked insight/i })).toBeInTheDocument();
    expect(screen.getByText(/mocked insight summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidence ~72%/)).toBeInTheDocument();
    expect(mockGenerateDashboardAIInsights).toHaveBeenCalled();
  });
});

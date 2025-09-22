import React from 'react';
import { render, screen, within } from '@testing-library/react';
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
  it('shows all-time total when allEntries provided', () => {
    const today = new Date();
    const entries = [
      makeEntry('1', new Date(today.getTime() - 2 * 24 * 3600 * 1000).toISOString(), 3),
      makeEntry('2', new Date(today.getTime() - 1 * 24 * 3600 * 1000).toISOString(), 5)
    ];
    const allEntries = [...entries, makeEntry('3', new Date(today.getTime() - 30 * 24 * 3600 * 1000).toISOString(), 4)];

  render(<DashboardOverview entries={entries as unknown as PainEntry[]} allEntries={allEntries as unknown as PainEntry[]} />);

    expect(screen.getByText('Total Entries')).toBeInTheDocument();
    // the visible value should reflect allEntries length (3)
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('rounds average and weekly numbers to one decimal', () => {
    const today = new Date();
    const entries = [
      makeEntry('1', today.toISOString(), 3),
      makeEntry('2', today.toISOString(), 4)
    ];

  render(<DashboardOverview entries={entries as unknown as PainEntry[]} allEntries={entries as unknown as PainEntry[]} />);

  // Average pain should be displayed with one decimal (3.5) inside the Average Pain card
  const avgTitle = screen.getByText('Average Pain');
  const avgContainer = avgTitle.parentElement;
  expect(avgContainer).toBeTruthy();
  expect(within(avgContainer!).getByText('3.5')).toBeTruthy();
  });

  it('counts today entries using local date match', () => {
    const now = new Date();
    const isoNow = now.toISOString();
    const entries = [makeEntry('1', isoNow, 2), makeEntry('2', new Date(now.getTime() - 24 * 3600 * 1000).toISOString(), 2)];

  render(<DashboardOverview entries={entries as unknown as PainEntry[]} allEntries={entries as unknown as PainEntry[]} />);

    // Today's entries should be 1
    expect(screen.getByText("Today's Entries")).toBeInTheDocument();
    expect(screen.getByText('1')).toBeTruthy();
  });
});

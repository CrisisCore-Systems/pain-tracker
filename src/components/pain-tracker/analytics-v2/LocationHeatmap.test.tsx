import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocationHeatmap } from './LocationHeatmap';
import type { PainEntry } from '../../../types';

// Mock the SVG-heavy body map to keep this test focused and fast.
vi.mock('../../body-mapping/InteractiveBodyMap', () => ({
  InteractiveBodyMap: () => <div>InteractiveBodyMap</div>,
}));

describe('LocationHeatmap', () => {
  const entries: PainEntry[] = [
    {
      id: 1,
      timestamp: '2024-01-01T08:00:00Z',
      baselineData: { pain: 5, locations: ['lower back'], symptoms: [] },
      functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
      medications: { current: [], changes: '', effectiveness: '' },
      treatments: { recent: [], effectiveness: '', planned: [] },
      qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
      workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
      comparison: { worseningSince: '', newLimitations: [] },
      notes: '',
    },
    {
      id: 2,
      timestamp: '2024-01-02T08:00:00Z',
      baselineData: { pain: 8, locations: ['lower back', 'neck'], symptoms: [] },
      functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
      medications: { current: [], changes: '', effectiveness: '' },
      treatments: { recent: [], effectiveness: '', planned: [] },
      qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
      workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
      comparison: { worseningSince: '', newLimitations: [] },
      notes: '',
    },
  ];

  it('renders and can switch to Grid View', () => {
    render(<LocationHeatmap entries={entries} />);
    expect(screen.getByText('Pain Location Heatmap')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /grid view/i }));
    expect(screen.getByText('Over Time')).toBeInTheDocument();
    expect(screen.getByText(/Pain Intensity:/)).toBeInTheDocument();
  });

  it('renders time cells that expose intensity and frequency', () => {
    render(<LocationHeatmap entries={entries} />);
    fireEvent.click(screen.getByRole('button', { name: /grid view/i }));

    // One of the cells should mention location + date + entries in an accessible label.
    expect(
      screen.getByLabelText(/Lower Back, 2024-01-02: .*\(1 entry\)/)
    ).toBeInTheDocument();

    // And the count should be visible in the cell.
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });
});

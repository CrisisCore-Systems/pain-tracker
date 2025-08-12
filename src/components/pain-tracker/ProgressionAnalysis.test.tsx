import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressionAnalysis } from './ProgressionAnalysis';
import type { PainEntry } from '../../types';

// Mock data
const mockEntries: PainEntry[] = [
  {
    id: 1,
    timestamp: '2024-01-01T10:00:00Z',
    baselineData: {
      pain: 5,
      locations: ['lower back'],
      symptoms: ['aching'],
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
  },
  {
    id: 2,
    timestamp: '2024-01-02T10:00:00Z',
    baselineData: {
      pain: 7,
      locations: ['lower back', 'neck'],
      symptoms: ['aching', 'stiffness'],
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
  },
  {
    id: 3,
    timestamp: '2024-01-03T10:00:00Z',
    baselineData: {
      pain: 4,
      locations: ['lower back'],
      symptoms: ['aching'],
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
  },
];

describe('ProgressionAnalysis', () => {
  it('renders without crashing', () => {
    render(<ProgressionAnalysis entries={[]} />);
    expect(screen.getByText('Progression Analysis')).toBeDefined();
  });

  it('shows empty state message when no entries', () => {
    render(<ProgressionAnalysis entries={[]} />);
    expect(screen.getByText('No data available for the selected period.')).toBeDefined();
  });

  it('calculates and displays trends correctly', () => {
    render(<ProgressionAnalysis entries={mockEntries} />);

    // Check for trend sections
    expect(screen.getByText('Pain Trend')).toBeDefined();
    expect(screen.getByText('Symptoms Trend')).toBeDefined();
    expect(screen.getByText('Locations Trend')).toBeDefined();
  });

  it('filters entries based on period', () => {
    const period = {
      start: '2024-01-02T00:00:00Z',
      end: '2024-01-03T23:59:59Z',
    };

    render(<ProgressionAnalysis entries={mockEntries} period={period} />);

    // Should only show trends for Jan 2-3
    const painTrendText = screen.getByText(/point (increasing|decreasing|stable)/);
    expect(painTrendText).toBeDefined();
  });

  it('handles single day of entries', () => {
    const singleDayEntries = mockEntries.slice(0, 1);
    render(<ProgressionAnalysis entries={singleDayEntries} />);

    // Should show data but no trends (needs at least 2 points for trends)
    expect(screen.getByText('Progression Analysis')).toBeDefined();
  });

  it('updates when entries change', () => {
    const { rerender } = render(<ProgressionAnalysis entries={mockEntries.slice(0, 1)} />);

    // Initially should have no trends (1 entry)
    expect(screen.queryByText(/point (increasing|decreasing|stable)/)).toBeNull();

    // Update with more entries
    rerender(<ProgressionAnalysis entries={mockEntries} />);

    // Should now show trends
    expect(screen.getByText(/point (increasing|decreasing|stable)/)).toBeDefined();
  });
});

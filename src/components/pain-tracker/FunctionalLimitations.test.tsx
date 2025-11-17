import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FunctionalLimitations } from './FunctionalLimitations';
import type { PainEntry } from '../../types';

const mockEntries: PainEntry[] = [
  {
    id: 1,
    timestamp: '2024-01-01T10:00:00Z',
    baselineData: {
      pain: 6,
      locations: ['lower back'],
      symptoms: ['aching'],
    },
    functionalImpact: {
      limitedActivities: ['bending', 'lifting'],
      assistanceNeeded: ['dressing'],
      mobilityAids: ['cane'],
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
      limitedActivities: ['bending', 'reaching'],
      assistanceNeeded: ['dressing', 'bathing'],
      mobilityAids: ['cane', 'walker'],
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

describe('FunctionalLimitations', () => {
  it('renders without crashing', () => {
    render(<FunctionalLimitations entries={[]} />);
    expect(screen.getByText('Functional Limitations Analysis')).toBeDefined();
  });

  it('shows empty state when no entries', () => {
    render(<FunctionalLimitations entries={[]} />);
    expect(screen.getByText('No functional limitations recorded in this period.')).toBeDefined();
  });

  it('displays limitations from entries', () => {
    render(<FunctionalLimitations entries={mockEntries} />);

    // Check activities
    expect(screen.getByText('bending')).toBeDefined();
    expect(screen.getByText('lifting')).toBeDefined();
    expect(screen.getByText('reaching')).toBeDefined();

    // Check assistance needed
    expect(screen.getAllByText('dressing')).toHaveLength(3); // Appears multiple times
    expect(screen.getAllByText('bathing')).toHaveLength(2); // Also appears multiple times

    // Check mobility aids
    expect(screen.getAllByText('cane')).toHaveLength(3); // Appears multiple times
    expect(screen.getAllByText('walker')).toHaveLength(2); // Appears multiple times
  });

  it('calculates frequency correctly', () => {
    render(<FunctionalLimitations entries={mockEntries} />);

    // 'bending' appears in both entries
    expect(screen.getByText('Reported 2 times')).toBeDefined();

    // 'lifting' and 'reaching' appear in one entry each - but there are multiple "Reported 1 times"
    expect(screen.getAllByText('Reported 1 times')).toHaveLength(2);
  });

  it('calculates average pain correctly', () => {
    render(<FunctionalLimitations entries={mockEntries} />);

    // For 'bending': pain levels 6 and 7, average 6.5
    const bendingSection = screen.getByText('bending').closest('.bg-gray-50');
    expect(bendingSection?.textContent).toContain('Avg. Pain: 6.5');
  });

  it('filters entries based on period', () => {
    const period = {
      start: '2024-01-02T00:00:00Z',
      end: '2024-01-02T23:59:59Z',
    };

    render(<FunctionalLimitations entries={mockEntries} period={period} />);

    // Should only show data from Jan 2
    expect(screen.getByText('reaching')).toBeDefined(); // Jan 2 activity
    expect(screen.queryByText('lifting')).toBeNull(); // Jan 1 activity
  });

  it('sorts limitations by frequency', () => {
    render(<FunctionalLimitations entries={mockEntries} />);

    const limitations = screen.getAllByText(/Reported \d+ times/);
    const frequencies = limitations.map(el => parseInt(el.textContent?.match(/\d+/)?.[0] || '0'));

    // Check that frequencies are in descending order
    expect(frequencies).toEqual([...frequencies].sort((a, b) => b - a));
  });
});

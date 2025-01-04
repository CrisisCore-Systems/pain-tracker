import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NerveSymptoms } from './NerveSymptoms';
import type { PainEntry } from '../../types';

const mockEntries: PainEntry[] = [
  {
    id: 1,
    timestamp: '2024-01-01T10:00:00Z',
    baselineData: {
      pain: 6,
      locations: ['lower back', 'leg'],
      symptoms: ['tingling', 'numbness'],
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
      locations: ['leg', 'foot'],
      symptoms: ['tingling', 'burning'],
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

describe('NerveSymptoms', () => {
  it('renders without crashing', () => {
    render(<NerveSymptoms entries={[]} />);
    expect(screen.getByText('Nerve Symptoms Analysis')).toBeDefined();
  });

  it('shows empty state when no entries', () => {
    render(<NerveSymptoms entries={[]} />);
    expect(screen.getByText('No nerve symptoms recorded in this period.')).toBeDefined();
  });

  it('displays nerve symptoms from entries', () => {
    render(<NerveSymptoms entries={mockEntries} />);
    
    // Check symptoms
    expect(screen.getByText('tingling')).toBeDefined();
    expect(screen.getByText('numbness')).toBeDefined();
    expect(screen.getByText('burning')).toBeDefined();
  });

  it('calculates frequency correctly', () => {
    render(<NerveSymptoms entries={mockEntries} />);
    
    // 'tingling' appears in both entries
    const tinglingSection = screen.getByText('tingling').closest('.bg-gray-50');
    expect(tinglingSection?.textContent).toContain('Reported 2 times');
    
    // 'burning' appears in one entry
    const burningSection = screen.getByText('burning').closest('.bg-gray-50');
    expect(burningSection?.textContent).toContain('Reported 1 times');
  });

  it('shows affected areas for each symptom', () => {
    render(<NerveSymptoms entries={mockEntries} />);
    
    // Check locations for tingling (appears in both entries)
    const tinglingSection = screen.getByText('tingling').closest('.bg-gray-50');
    expect(tinglingSection?.textContent).toContain('lower back');
    expect(tinglingSection?.textContent).toContain('leg');
    expect(tinglingSection?.textContent).toContain('foot');
  });

  it('calculates average pain correctly', () => {
    render(<NerveSymptoms entries={mockEntries} />);
    
    // For 'tingling': pain levels 6 and 7, average 6.5
    const tinglingSection = screen.getByText('tingling').closest('.bg-gray-50');
    expect(tinglingSection?.textContent).toContain('Avg. Pain: 6.5');
  });

  it('filters entries based on period', () => {
    const period = {
      start: '2024-01-02T00:00:00Z',
      end: '2024-01-02T23:59:59Z',
    };

    render(<NerveSymptoms entries={mockEntries} period={period} />);
    
    // Should only show data from Jan 2
    expect(screen.getByText('burning')).toBeDefined(); // Jan 2 symptom
    expect(screen.queryByText('numbness')).toBeNull(); // Jan 1 symptom
  });

  it('sorts symptoms by frequency', () => {
    render(<NerveSymptoms entries={mockEntries} />);
    
    const symptoms = screen.getAllByText(/Reported \d+ times/);
    const frequencies = symptoms.map(el => 
      parseInt(el.textContent?.match(/\d+/)?.[0] || '0')
    );
    
    // Check that frequencies are in descending order
    expect(frequencies).toEqual([...frequencies].sort((a, b) => b - a));
  });

  it('only includes nerve-specific symptoms', () => {
    const entriesWithMixedSymptoms: PainEntry[] = [
      {
        ...mockEntries[0],
        baselineData: {
          ...mockEntries[0].baselineData,
          symptoms: ['tingling', 'aching', 'stiffness'], // non-nerve symptoms
        },
      },
    ];

    render(<NerveSymptoms entries={entriesWithMixedSymptoms} />);
    
    // Should show nerve symptoms
    expect(screen.getByText('tingling')).toBeDefined();
    
    // Should not show non-nerve symptoms
    expect(screen.queryByText('aching')).toBeNull();
    expect(screen.queryByText('stiffness')).toBeNull();
  });
}); 
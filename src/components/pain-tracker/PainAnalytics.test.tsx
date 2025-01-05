import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PainAnalytics } from './PainAnalytics';
import type { PainEntry } from '../../types';

describe('PainAnalytics', () => {
  const mockEntries: PainEntry[] = [
    {
      id: 1,
      timestamp: '2024-01-01T08:00:00Z',
      baselineData: {
        pain: 5,
        locations: ['Lower Back', 'Neck'],
        symptoms: ['Stiffness', 'Burning']
      },
      functionalImpact: {
        limitedActivities: ['Walking', 'Sitting'],
        assistanceNeeded: [],
        mobilityAids: []
      },
      medications: {
        current: [],
        changes: '',
        effectiveness: ''
      },
      treatments: {
        recent: [],
        effectiveness: '',
        planned: []
      },
      qualityOfLife: {
        sleepQuality: 6,
        moodImpact: 5,
        socialImpact: []
      },
      workImpact: {
        missedWork: 0,
        modifiedDuties: [],
        workLimitations: []
      },
      comparison: {
        worseningSince: '',
        newLimitations: []
      },
      notes: ''
    },
    {
      id: 2,
      timestamp: '2024-01-01T14:00:00Z',
      baselineData: {
        pain: 7,
        locations: ['Lower Back'],
        symptoms: ['Stiffness']
      },
      functionalImpact: {
        limitedActivities: ['Walking'],
        assistanceNeeded: [],
        mobilityAids: []
      },
      medications: {
        current: [],
        changes: '',
        effectiveness: ''
      },
      treatments: {
        recent: [],
        effectiveness: '',
        planned: []
      },
      qualityOfLife: {
        sleepQuality: 5,
        moodImpact: 6,
        socialImpact: []
      },
      workImpact: {
        missedWork: 0,
        modifiedDuties: [],
        workLimitations: []
      },
      comparison: {
        worseningSince: '',
        newLimitations: []
      },
      notes: ''
    }
  ];

  it('renders without crashing', () => {
    render(<PainAnalytics entries={mockEntries} />);
    expect(screen.getByText('Pain Overview')).toBeInTheDocument();
  });

  it('displays correct average pain', () => {
    render(<PainAnalytics entries={mockEntries} />);
    const avgPain = (5 + 7) / 2;
    expect(screen.getByText(avgPain.toFixed(1))).toBeInTheDocument();
  });

  it('shows pain trend information', () => {
    render(<PainAnalytics entries={mockEntries} />);
    expect(screen.getByText(/[↑↓]/)).toBeInTheDocument(); // Should show either up or down arrow
  });

  it('displays tracking summary', () => {
    render(<PainAnalytics entries={mockEntries} />);
    expect(screen.getByText('Total Entries')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total entries count
  });

  it('renders all chart sections', () => {
    render(<PainAnalytics entries={mockEntries} />);
    expect(screen.getByText('Pain by Time of Day')).toBeInTheDocument();
    expect(screen.getByText('Pain by Location')).toBeInTheDocument();
    expect(screen.getByText('Symptoms Analysis')).toBeInTheDocument();
  });

  it('handles empty entries gracefully', () => {
    render(<PainAnalytics entries={[]} />);
    expect(screen.getByText('Average Pain')).toBeInTheDocument();
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });
}); 
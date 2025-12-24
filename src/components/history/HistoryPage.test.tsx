import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PainEntry } from '../../types';
import { HistoryPage } from './HistoryPage';

const makeEntry = (overrides: Partial<PainEntry> = {}): PainEntry => ({
  id: String(Math.random()),
  timestamp: new Date('2025-12-22T23:25:00.000Z').toISOString(),
  baselineData: {
    pain: 5,
    locations: ['Lower back'],
    symptoms: ['Aching'],
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

describe('HistoryPage', () => {
  it('filters entries by search query', () => {
    const onEditEntry = vi.fn();
    const entries = [
      makeEntry({
        id: 'a',
        baselineData: { pain: 7, locations: ['Neck'], symptoms: ['Cramping'] },
        notes: 'Woke up stiff',
      }),
      makeEntry({
        id: 'b',
        baselineData: { pain: 3, locations: ['Lower back'], symptoms: ['Aching'] },
        notes: 'Felt okay',
      }),
    ];

    render(<HistoryPage entries={entries} onEditEntry={onEditEntry} />);

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'cramping' } });

    expect(screen.getByText(/Pain 7\/10/)).toBeInTheDocument();
    expect(screen.queryByText(/Pain 3\/10/)).not.toBeInTheDocument();
  });

  it('calls onEditEntry when Edit clicked', () => {
    const onEditEntry = vi.fn();
    const entries = [makeEntry({ id: 'edit-me' })];

    render(<HistoryPage entries={entries} onEditEntry={onEditEntry} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEditEntry).toHaveBeenCalledWith('edit-me');
  });
});

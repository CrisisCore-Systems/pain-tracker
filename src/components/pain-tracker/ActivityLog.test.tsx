import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityLog } from './ActivityLog';
import type { PainEntry } from '../../types';

const mockEntries: PainEntry[] = [
  {
    id: 1,
    timestamp: '2023-01-01T10:00:00Z',
    baselineData: {
      pain: 5,
      locations: ['lower back'],
      symptoms: ['aching']
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
      sleepQuality: 0,
      moodImpact: 0,
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
    notes: 'Test note 1'
  },
  {
    id: 2,
    timestamp: '2023-01-02T10:00:00Z',
    baselineData: {
      pain: 6,
      locations: ['lower back'],
      symptoms: ['aching']
    },
    functionalImpact: {
      limitedActivities: ['Walking', 'Standing'],
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
      sleepQuality: 0,
      moodImpact: 0,
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
    notes: 'Test note 2'
  }
];

describe('ActivityLog', () => {
  it('renders without crashing', () => {
    render(<ActivityLog entries={mockEntries} />);
    expect(screen.getByText('Activity Impact Log')).toBeInTheDocument();
  });

  it('displays activities with correct ARIA roles and labels', () => {
    render(<ActivityLog entries={mockEntries} />);
    
    // Check main region
    expect(screen.getByRole('region', { name: 'Activity Impact Log' })).toBeInTheDocument();
    
    // Check activities grid
    expect(screen.getByRole('grid')).toBeInTheDocument();
    
    // Check activity cells
    const activities = screen.getAllByRole('gridcell');
    expect(activities).toHaveLength(3); // Walking, Sitting, Standing
    
    // Check aria-labels
    expect(screen.getByLabelText(/Walking: 2 times/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sitting: 1 times/)).toBeInTheDocument();
  });

  it('supports keyboard navigation between activities', () => {
    render(<ActivityLog entries={mockEntries} />);
    const activities = screen.getAllByRole('gridcell');
    
    // Initial state - first activity should be focusable
    expect(activities[0]).toHaveAttribute('tabIndex', '0');
    activities[0].focus();
    
    // Test right arrow
    fireEvent.keyDown(activities[0], { key: 'ArrowRight' });
    expect(activities[1]).toHaveFocus();
    
    // Test left arrow
    fireEvent.keyDown(activities[1], { key: 'ArrowLeft' });
    expect(activities[0]).toHaveFocus();
    
    // Test down arrow
    fireEvent.keyDown(activities[0], { key: 'ArrowDown' });
    expect(activities[Math.min(2, activities.length - 1)]).toHaveFocus();
    
    // Test up arrow
    fireEvent.keyDown(activities[2], { key: 'ArrowUp' });
    expect(activities[0]).toHaveFocus();
    
    // Test end key
    fireEvent.keyDown(activities[0], { key: 'End' });
    expect(activities[activities.length - 1]).toHaveFocus();
    
    // Test home key
    fireEvent.keyDown(activities[activities.length - 1], { key: 'Home' });
    expect(activities[0]).toHaveFocus();
  });

  it('shows activity details with proper ARIA roles when selected', () => {
    render(<ActivityLog entries={mockEntries} />);
    
    // Click on Walking activity
    fireEvent.click(screen.getByText('Walking'));
    
    // Check details region
    expect(screen.getByRole('region', { name: 'Details for Walking' })).toBeInTheDocument();
    
    // Check list structure
    expect(screen.getByRole('list')).toBeInTheDocument();
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2); // Two entries with Walking
    
    // Check accessibility labels
    expect(screen.getByLabelText(/Pain Level: 5/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes: Test note 1/)).toBeInTheDocument();
  });

  it('filters entries based on period when provided', () => {
    const period = {
      start: '2023-01-02T00:00:00Z',
      end: '2023-01-02T23:59:59Z'
    };
    
    render(<ActivityLog entries={mockEntries} period={period} />);
    
    // Only activities from January 2nd should be shown
    expect(screen.queryByText('Sitting')).not.toBeInTheDocument();
    expect(screen.getByText('Standing')).toBeInTheDocument();
  });

  it('maintains focus when activities are filtered', () => {
    const { rerender } = render(<ActivityLog entries={mockEntries} />);
    
    // Focus first activity
    const activities = screen.getAllByRole('gridcell');
    activities[0].focus();
    
    // Filter entries
    const filteredEntries = mockEntries.slice(1);
    rerender(<ActivityLog entries={filteredEntries} />);
    
    // Check that focus is maintained on a valid activity
    expect(document.activeElement).toHaveAttribute('role', 'gridcell');
  });
}); 
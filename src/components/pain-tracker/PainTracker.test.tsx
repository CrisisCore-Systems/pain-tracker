import React from 'react';
import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PainTracker } from './index.tsx';
import useLocalStorage from '../../hooks/useLocalStorage';
import type { PainEntry } from '../../types';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
  vi.useRealTimers();
});

// Mock the current date for consistent testing
const mockDate = new Date('2024-01-04T12:00:00Z');
vi.setSystemTime(mockDate);

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock child components with proper prop handling
vi.mock('./PainChart', () => {
  return {
    __esModule: true,
    PainChart: function MockPainChart({ entries }: { entries: PainEntry[] }) {
      return (
        <div role="complementary" data-testid="pain-chart" data-entries={JSON.stringify(entries)}>
          Pain Chart
        </div>
      );
    },
  };
});

vi.mock('./PainHistory', () => {
  return {
    __esModule: true,
    PainHistory: function MockPainHistory({ entries }: { entries: PainEntry[] }) {
      return (
        <div data-testid="pain-history" data-entries={JSON.stringify(entries)}>
          Pain History
        </div>
      );
    },
  };
});

// Mock PainEntryForm with error simulation
vi.mock('./PainEntryForm', () => {
  return {
    __esModule: true,
    PainEntryForm: function MockPainEntryForm({
      onSubmit,
    }: {
      onSubmit: (data: Partial<PainEntry>) => void;
    }) {
      const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        onSubmit({
          baselineData: {
            pain: 5,
            locations: ['back', 'neck'],
            symptoms: ['stiffness'],
          },
          qualityOfLife: {
            sleepQuality: 3,
            moodImpact: 4,
            socialImpact: ['reduced social activities'],
          },
        });
      };

      const handleInvalidSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        const invalidData = {
          baselineData: {
            pain: -1,
            locations: [],
            symptoms: ['invalid symptom'],
          },
          qualityOfLife: {
            sleepQuality: -1,
            moodImpact: 11,
            socialImpact: [],
          },
        } as Partial<PainEntry>;

        onSubmit(invalidData);
      };

      return (
        <form
          data-testid="pain-form"
          role="form"
          aria-label="Pain Entry Form"
          onSubmit={e => e.preventDefault()}
        >
          Pain Entry Form
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
          <button type="button" onClick={handleInvalidSubmit} data-testid="invalid-submit">
            Submit Invalid
          </button>
        </form>
      );
    },
  };
});

interface ReportPeriod {
  start: string;
  end: string;
}

vi.mock('./WCBReport', () => {
  return {
    __esModule: true,
    WCBReportGenerator: function MockWCBReport({
      entries,
      period,
    }: {
      entries: PainEntry[];
      period: ReportPeriod;
    }) {
      return (
        <div data-testid="wcb-report" data-period={JSON.stringify(period)}>
          <div className="mb-4 flex gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                className="border rounded px-2 py-1"
                value={period.start}
                readOnly
                aria-label="Report start date"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                className="border rounded px-2 py-1"
                value={period.end}
                readOnly
                aria-label="Report end date"
              />
            </div>
          </div>
          <div>WCB Report</div>
        </div>
      );
    },
  };
});

describe('PainTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders without crashing', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    render(<PainTracker />);
    expect(screen.getByText('Pain Tracker')).toBeInTheDocument();
  });

  it('toggles WCB report visibility', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    render(<PainTracker />);
    const toggleButton = screen.getByText('Show WCB Report');

    // Initially, WCB report should not be visible
    expect(screen.queryByText('WCB Report')).not.toBeInTheDocument();

    // Click to show report
    fireEvent.click(toggleButton);
    expect(screen.getByText('WCB Report')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();

    // Click to hide report
    fireEvent.click(screen.getByText('Hide WCB Report'));
    expect(screen.queryByText('WCB Report')).not.toBeInTheDocument();
  });

  it('shows pain entry form and chart', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    render(<PainTracker />);
    expect(screen.getByTestId('pain-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pain-form')).toBeInTheDocument();
  });

  it('handles new pain entry submission', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    render(<PainTracker />);
    const submitButton = screen.getByText('Submit');

    // Submit a new entry
    fireEvent.click(submitButton);

    // Verify localStorage was called with correct data
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
    const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
    expect(savedData).toHaveLength(1);

    const newEntry = savedData[0];
    expect(newEntry).toMatchObject({
      baselineData: {
        pain: 5,
        locations: ['back', 'neck'],
        symptoms: ['stiffness'],
      },
      qualityOfLife: {
        sleepQuality: 3,
        moodImpact: 4,
        socialImpact: ['reduced social activities'],
      },
    });

    // Verify timestamp and ID
    expect(newEntry.id).toBeDefined();
    expect(newEntry.timestamp).toBeDefined();
    expect(new Date(newEntry.timestamp).getTime()).toBe(mockDate.getTime());
  });

  it('initializes report period correctly', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    render(<PainTracker />);
    fireEvent.click(screen.getByText('Show WCB Report'));

    const wcbReport = screen.getByTestId('wcb-report');
    const period = JSON.parse(wcbReport.dataset.period!) as ReportPeriod;

    // Verify period is 30 days
    const endDate = new Date(period.end);
    const startDate = new Date(period.start);
    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysDiff).toBe(30);
  });

  it('passes entries to child components', () => {
    const testEntries = [
      {
        id: mockDate.getTime(),
        timestamp: mockDate.toISOString(),
        baselineData: { pain: 5, locations: ['back', 'neck'], symptoms: ['stiffness'] },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: {
          sleepQuality: 3,
          moodImpact: 4,
          socialImpact: ['reduced social activities'],
        },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: '',
      },
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testEntries));

    render(<PainTracker />);

    const chart = screen.getByTestId('pain-chart');
    const history = screen.getByTestId('pain-history');

    expect(JSON.parse(chart.dataset.entries!)).toEqual(testEntries);
    expect(JSON.parse(history.dataset.entries!)).toEqual(testEntries);
  });

  describe('Error Handling', () => {
    it('handles localStorage access errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Failed to access localStorage');
      });

      render(<PainTracker />);

      // Should show an error message
      expect(screen.getByText(/Unable to load pain entries/i)).toBeInTheDocument();

      // Should still render the form for new entries
      expect(screen.getByTestId('pain-form')).toBeInTheDocument();
    });

    it('validates pain entry data before saving', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      render(<PainTracker />);

      // Try to submit invalid data
      const invalidSubmitButton = screen.getByTestId('invalid-submit');
      fireEvent.click(invalidSubmitButton);

      // Should not save to localStorage with invalid data
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

      // Should show validation error message
      expect(screen.getByText(/Invalid pain entry data/i)).toBeInTheDocument();
    });

    it('handles empty entries array gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      render(<PainTracker />);

      // Should show empty state message
      expect(screen.getByText(/No pain entries yet/i)).toBeInTheDocument();

      // Chart should still render with empty data
      const chart = screen.getByTestId('pain-chart');
      expect(JSON.parse(chart.dataset.entries!)).toEqual([]);
    });

    it('validates report period dates', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      render(<PainTracker />);
      fireEvent.click(screen.getByText('Show WCB Report'));

      const wcbReport = screen.getByTestId('wcb-report');
      const period = JSON.parse(wcbReport.dataset.period!) as ReportPeriod;

      // Verify dates are valid
      expect(() => new Date(period.start)).not.toThrow();
      expect(() => new Date(period.end)).not.toThrow();

      // End date should not be before start date
      expect(new Date(period.end).getTime()).toBeGreaterThan(new Date(period.start).getTime());
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const { container } = render(<PainTracker />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      render(<PainTracker />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Pain Tracker');

      // All interactive elements should be reachable by keyboard
      const allButtons = screen.getAllByRole('button');
      allButtons.forEach(button => {
        expect(button).toHaveAttribute('type');
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should have proper ARIA labels and roles', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      render(<PainTracker />);

      // Error message should have alert role
      const errorContainer = screen.queryByRole('alert');
      expect(errorContainer).not.toBeInTheDocument();

      // Chart should have complementary role
      const chart = screen.getByRole('complementary');
      expect(chart).toBeInTheDocument();

      // Form should be properly labeled
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('data-testid', 'pain-form');
    });

    it('should handle keyboard navigation', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      render(<PainTracker />);

      const toggleButton = screen.getByText('Show WCB Report');
      toggleButton.focus();
      expect(document.activeElement).toBe(toggleButton);

      // Simulate keyboard interaction
      fireEvent.keyDown(toggleButton, { key: 'Enter' });
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();

      // Date inputs should be keyboard accessible
      const startDateInput = screen.getByLabelText('Start Date');
      expect(startDateInput).toHaveAttribute('type', 'date');
    });

    it('should maintain focus management', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      render(<PainTracker />);

      // Toggle WCB report
      const toggleButton = screen.getByText('Show WCB Report');
      fireEvent.click(toggleButton);

      // Focus should move to the first interactive element in the report
      const startDateInput = screen.getByLabelText('Start Date');
      expect(startDateInput).toBeInTheDocument();

      // Hide report
      fireEvent.click(toggleButton);
      expect(document.activeElement).toBe(toggleButton);
    });

    it('should have proper color contrast', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      render(<PainTracker />);

      const errorMessage = screen.queryByRole('alert');
      if (errorMessage) {
        // Error message should have sufficient color contrast
        expect(errorMessage).toHaveClass('text-red-700');
        expect(errorMessage).toHaveClass('bg-red-100');
      }

      // Primary button should have sufficient contrast
      const button = screen.getByText('Show WCB Report');
      expect(button).toHaveClass('bg-blue-500');
      expect(button).toHaveClass('text-white');
    });

    it('should provide clear error messages', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      render(<PainTracker />);

      // Submit invalid data
      const invalidSubmitButton = screen.getByTestId('invalid-submit');
      fireEvent.click(invalidSubmitButton);

      // Error message should be clear and descriptive
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent(/invalid pain entry data/i);
      expect(errorMessage).toHaveTextContent(/please check your input values/i);
    });
  });
});

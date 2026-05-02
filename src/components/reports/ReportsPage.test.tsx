import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportsPage } from './ReportsPage';
import type { PainEntry } from '../../types';

const toastSuccess = vi.fn();
const toastError = vi.fn();
const toastInfo = vi.fn();

// Mock the export functions
vi.mock('../../utils/pain-tracker/export', () => ({
  exportToCSV: vi.fn(() => 'mock,csv,data'),
  exportToJSON: vi.fn(() => '{"mock": "json"}'),
  exportToPDF: vi.fn(() => 'data:application/pdf;base64,mock'),
  downloadData: vi.fn(),
}));

// Mock the toast hook
vi.mock('../feedback', () => ({
  useToast: () => ({
    success: toastSuccess,
    error: toastError,
    info: toastInfo,
  }),
}));

vi.mock('../../contexts/SubscriptionContext', () => ({
  useSubscription: () => ({ currentTier: 'free' }),
}));

vi.mock('../../services/EntitlementService', () => ({
  entitlementService: {
    hasEntitlement: vi.fn(() => false),
  },
}));

vi.mock('../../utils/pain-tracker/wcb-export', () => ({
  downloadWorkSafeBCPDF: vi.fn(),
}));

const createMockEntry = (overrides: Partial<PainEntry> = {}): PainEntry => ({
  id: `entry-${Math.random()}`,
  timestamp: new Date().toISOString(),
  baselineData: {
    pain: 5,
    locations: ['lower-back'],
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
    sleepQuality: 6,
    moodImpact: 5,
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
  notes: 'Test entry',
  ...overrides,
});

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header', () => {
    render(<ReportsPage entries={[]} />);
    
    expect(screen.getByText('Reports & Export')).toBeInTheDocument();
    expect(screen.getByText(/review which report workflows are open on this plan/i)).toBeInTheDocument();
  });

  it('shows no data warning when entries are empty', () => {
    render(<ReportsPage entries={[]} />);
    
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
  });

  it('displays quick stats when entries exist', () => {
    const entries = [
      createMockEntry({ baselineData: { pain: 4, locations: [], symptoms: [] } }),
      createMockEntry({ baselineData: { pain: 6, locations: [], symptoms: [] } }),
    ];
    
    render(<ReportsPage entries={entries} />);
    
    expect(screen.getByText('Total Entries')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Avg Pain Level')).toBeInTheDocument();
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });

  it('renders export options', () => {
    render(<ReportsPage entries={[createMockEntry()]} />);
    
    expect(screen.getByText('Quick Export')).toBeInTheDocument();
    expect(screen.getByText('CSV Spreadsheet')).toBeInTheDocument();
    expect(screen.getByText('JSON Data')).toBeInTheDocument();
    expect(screen.getByText('PDF Report')).toBeInTheDocument();
  });

  it('renders specialized reports section', () => {
    render(<ReportsPage entries={[createMockEntry()]} />);
    
    expect(screen.getByText('Specialized Reports')).toBeInTheDocument();
    expect(screen.getByText('WorkSafe BC Report')).toBeInTheDocument();
    expect(screen.getByText('Insurance Report')).toBeInTheDocument();
    expect(screen.getByText('Clinical Summary')).toBeInTheDocument();
    expect(screen.getAllByText('Not open yet').length).toBeGreaterThan(0);
  });

  it('has date range filter', () => {
    render(<ReportsPage entries={[createMockEntry()]} />);
    
    // Date range uses button group, not a combobox
    expect(screen.getByText('All Time')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 90 Days')).toBeInTheDocument();
  });

  it('filters entries by date range', async () => {
    const oldEntry = createMockEntry({
      timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    });
    const recentEntry = createMockEntry({
      timestamp: new Date().toISOString(),
    });
    
    render(<ReportsPage entries={[oldEntry, recentEntry]} />);
    
    // Default is last 7 days — click "All Time" to see both entries
    fireEvent.click(screen.getByText('All Time'));

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Click "Last 30 Days" — only recent entry
    fireEvent.click(screen.getByText('Last 30 Days'));

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('disables export buttons when no data available', () => {
    render(<ReportsPage entries={[]} />);
    
    // The export buttons should have cursor-not-allowed or be disabled
    const csvButton = screen.getByText('CSV Spreadsheet').closest('button');
    expect(csvButton).toHaveClass('cursor-not-allowed');
  });

  it('renders scheduled reports section', () => {
    render(<ReportsPage entries={[createMockEntry()]} />);
    
    expect(screen.getByText('Scheduled Reports')).toBeInTheDocument();
    expect(screen.getByText('No Scheduled Reports')).toBeInTheDocument();
    expect(screen.getByText('Schedule a Report')).toBeInTheDocument();
    expect(screen.getByText(/scheduled reports are not open in this build yet/i)).toBeInTheDocument();
  });

  it('renders recent exports section', () => {
    render(<ReportsPage entries={[createMockEntry()]} />);
    
    expect(screen.getByText('Recent Exports')).toBeInTheDocument();
    expect(screen.getByText('Your export history will appear here.')).toBeInTheDocument();
  });

  it('uses not-open-yet toast copy for unavailable specialized reports', () => {
    render(<ReportsPage entries={[createMockEntry()]} />);

    fireEvent.click(screen.getByRole('button', { name: /insurance report/i }));

    expect(toastInfo).toHaveBeenCalledWith(
      'Not Open Yet',
      'Insurance Report is not open in this build yet. It will arrive in a future update.'
    );
  });

  it('blocks the reports page WCB shortcut for Free users with explicit upgrade messaging', async () => {
    render(<ReportsPage entries={[createMockEntry()]} />);

    await waitFor(() => {
      expect(screen.getByText(/worksafe bc report/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/this report is clipped on free\. upgrade to basic or higher/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /worksafe bc report/i }));

    expect(toastInfo).toHaveBeenCalledWith(
      'Upgrade Required',
      'WorkSafeBC export stays closed on your current plan. Upgrade to Basic or higher to unlock it.'
    );
  });
});

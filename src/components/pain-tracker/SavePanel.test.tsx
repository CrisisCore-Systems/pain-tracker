import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SavePanel } from './SavePanel';
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
      limitedActivities: ['walking'],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [
        {
          name: 'Ibuprofen',
          dosage: '400mg',
          frequency: 'twice daily',
          effectiveness: 'moderate',
        },
      ],
      changes: '',
      effectiveness: '',
    },
    treatments: {
      recent: [],
      effectiveness: '',
      planned: [],
    },
    qualityOfLife: {
      sleepQuality: 7,
      moodImpact: 5,
      socialImpact: [],
    },
    workImpact: {
      missedWork: 1,
      modifiedDuties: [],
      workLimitations: [],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes: 'Test note',
  },
];

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
URL.createObjectURL = mockCreateObjectURL;
URL.revokeObjectURL = mockRevokeObjectURL;

// Mock document.createElement
const mockAnchorElement = {
  click: vi.fn(),
  href: '',
  download: '',
};
const originalCreateElement = document.createElement;
document.createElement = vi.fn(tagName => {
  if (tagName === 'a') return mockAnchorElement;
  return originalCreateElement.call(document, tagName);
}) as typeof document.createElement;

describe('SavePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SavePanel entries={[]} />);
    expect(screen.getByText('Data Management')).toBeDefined();
  });

  it('shows total entries count', () => {
    render(<SavePanel entries={mockEntries} />);
    expect(screen.getByText('Total Entries: 1')).toBeDefined();
  });

  it('shows date range when entries exist', () => {
    render(<SavePanel entries={mockEntries} />);
    expect(screen.getByText(/Date Range:/)).toBeDefined();
  });

  it('handles JSON export', () => {
    render(<SavePanel entries={mockEntries} />);

    fireEvent.click(screen.getByText('Export JSON'));

    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockAnchorElement.download).toBe('pain-tracker-export.json');
    expect(mockAnchorElement.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('handles CSV export', () => {
    render(<SavePanel entries={mockEntries} />);

    fireEvent.click(screen.getByText('Export CSV'));

    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockAnchorElement.download).toBe('pain-tracker-export.csv');
    expect(mockAnchorElement.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('uses custom export handler when provided', () => {
    const onExport = vi.fn();
    render(<SavePanel entries={mockEntries} onExport={onExport} />);

    fireEvent.click(screen.getByText('Export JSON'));

    expect(onExport).toHaveBeenCalledWith('json');
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
  });

  it('shows clear data button when entries exist', () => {
    render(<SavePanel entries={mockEntries} />);
    expect(screen.getByText('Clear All Data')).toBeDefined();
  });

  it('shows confirmation dialog when clear data clicked', () => {
    render(<SavePanel entries={mockEntries} />);

    fireEvent.click(screen.getByText('Clear All Data'));

    expect(screen.getByText('Are you sure you want to clear all data?')).toBeDefined();
    expect(screen.getByText('Yes, Clear Data')).toBeDefined();
    expect(screen.getByText('Cancel')).toBeDefined();
  });

  it('calls onClearData when confirmed', () => {
    const onClearData = vi.fn();
    render(<SavePanel entries={mockEntries} onClearData={onClearData} />);

    fireEvent.click(screen.getByText('Clear All Data'));
    fireEvent.click(screen.getByText('Yes, Clear Data'));

    expect(onClearData).toHaveBeenCalled();
  });

  it('hides confirmation dialog when cancelled', () => {
    render(<SavePanel entries={mockEntries} />);

    fireEvent.click(screen.getByText('Clear All Data'));
    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByText('Are you sure you want to clear all data?')).toBeNull();
  });

  it('formats CSV data correctly', () => {
    render(<SavePanel entries={mockEntries} />);

    fireEvent.click(screen.getByText('Export CSV'));

    const blob = mockCreateObjectURL.mock.calls[0][0];
    const reader = new FileReader();

    return new Promise<void>(resolve => {
      reader.onload = () => {
        const csv = reader.result as string;

        // Check headers
        expect(csv).toContain('Date,Pain Level,Locations,Symptoms');

        // Check data formatting
        expect(csv).toContain('lower back');
        expect(csv).toContain('aching');
        expect(csv).toContain('Ibuprofen 400mg');

        resolve();
      };

      reader.readAsText(blob);
    });
  });
});

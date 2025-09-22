import { describe, it, expect, vi } from 'vitest';
import { generatePDFReport, downloadPDF } from '../utils/pdfReportGenerator';
import type { PainEntry, ReportTemplate } from '../types';

// Mock jsPDF
vi.mock('jspdf', () => {
  const mockDoc: Record<string, unknown> = {};
  mockDoc.addPage = vi.fn();
  mockDoc.setFontSize = vi.fn();
  mockDoc.setFont = vi.fn();
  mockDoc.text = vi.fn();
  mockDoc.line = vi.fn();
  mockDoc.getNumberOfPages = vi.fn().mockReturnValue(1);
  mockDoc.setPage = vi.fn();
  mockDoc.lastAutoTable = { finalY: 0 };
  mockDoc.autoTable = vi.fn().mockImplementation(() => {
    // Provide a plausible finalY so generator logic can continue
  (mockDoc as unknown as Record<string, unknown>)['lastAutoTable'] = { finalY: 80 };
  });
  mockDoc.output = vi.fn().mockImplementation(() => new Blob(['%PDF-1.4'], { type: 'application/pdf' }));
  mockDoc.internal = { pageSize: { height: 297 } };

  return { default: vi.fn().mockImplementation(() => mockDoc) };
});

// Mock jspdf-autotable
vi.mock('jspdf-autotable', () => ({}));

// Mock URL and document for downloadPDF
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn().mockReturnValue('blob:url'),
    revokeObjectURL: vi.fn()
  },
  writable: true
});

Object.defineProperty(document, 'createElement', {
  value: vi.fn().mockReturnValue({
    href: '',
    download: '',
    click: vi.fn()
  }),
  writable: true
});

Object.defineProperty(document, 'body', {
  value: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  },
  writable: true
});

// Test data
const mockPainEntry: PainEntry = {
  id: 1,
  timestamp: '2024-01-04T12:00:00Z',
  baselineData: {
    pain: 6,
    locations: ['lower back', 'neck'],
    symptoms: ['stiffness', 'spasm']
  },
  functionalImpact: {
    limitedActivities: ['bending', 'lifting'],
    assistanceNeeded: ['dressing'],
    mobilityAids: ['cane']
  },
  medications: {
    current: [{
      name: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'twice daily',
      effectiveness: 'moderate'
    }],
    changes: 'none',
    effectiveness: 'moderate'
  },
  treatments: {
    recent: [{
      type: 'Physical Therapy',
      provider: 'ABC Clinic',
      date: '2024-01-03',
      effectiveness: 'good'
    }],
    effectiveness: 'good',
    planned: ['continue PT']
  },
  qualityOfLife: {
    sleepQuality: 6,
    moodImpact: 5,
    socialImpact: ['reduced social activities']
  },
  workImpact: {
    missedWork: 2,
    modifiedDuties: ['no heavy lifting'],
    workLimitations: ['standing limited']
  },
  comparison: {
    worseningSince: 'last week',
    newLimitations: ['difficulty driving']
  },
  notes: 'Pain worse in morning'
};

const mockTemplate: ReportTemplate = {
  id: 'test-template',
  name: 'Test Report',
  description: 'Test report template',
  type: 'summary',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      type: 'text',
      dataSource: 'overview',
      config: {}
    },
    {
      id: 'symptoms',
      title: 'Symptoms',
      type: 'table',
      dataSource: 'symptoms',
      config: {}
    }
  ],
  createdAt: '2024-01-01T00:00:00Z',
  lastModified: '2024-01-01T00:00:00Z'
};

describe('PDF Report Generator', () => {
  it('should generate PDF report successfully', async () => {
    const options = {
      template: mockTemplate,
      entries: [mockPainEntry],
      dateRange: {
        start: '2024-01-01T00:00:00Z',
        end: '2024-01-04T23:59:59Z'
      },
      title: 'Test Report'
    };

    const result = await generatePDFReport(options);
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('application/pdf');
  });

  it('should handle empty entries', async () => {
    const options = {
      template: mockTemplate,
      entries: [],
      dateRange: {
        start: '2024-01-01T00:00:00Z',
        end: '2024-01-04T23:59:59Z'
      },
      title: 'Empty Report'
    };

    const result = await generatePDFReport(options);
    expect(result).toBeInstanceOf(Blob);
  });

  it('should handle multiple entries', async () => {
    const entries = [
      mockPainEntry,
      {
        ...mockPainEntry,
        id: 2,
        timestamp: '2024-01-05T12:00:00Z',
        baselineData: {
          ...mockPainEntry.baselineData,
          pain: 4,
          symptoms: ['stiffness']
        }
      }
    ];

    const options = {
      template: mockTemplate,
      entries,
      dateRange: {
        start: '2024-01-01T00:00:00Z',
        end: '2024-01-05T23:59:59Z'
      },
      title: 'Multi-Entry Report'
    };

    const result = await generatePDFReport(options);
    expect(result).toBeInstanceOf(Blob);
  });
});

describe('PDF Download Utility', () => {
  it('should create download link and trigger download', () => {
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    const filename = 'test-report.pdf';

    downloadPDF(mockBlob, filename);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });
});

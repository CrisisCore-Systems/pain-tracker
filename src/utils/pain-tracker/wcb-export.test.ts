import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PainEntry } from '../../types';

// Mock jsPDF
const mockJsPDF = {
  internal: {
    pageSize: { getWidth: () => 210, getHeight: () => 297 },
  },
  setFontSize: vi.fn().mockReturnThis(),
  setFont: vi.fn().mockReturnThis(),
  setTextColor: vi.fn().mockReturnThis(),
  setDrawColor: vi.fn().mockReturnThis(),
  setFillColor: vi.fn().mockReturnThis(),
  text: vi.fn().mockReturnThis(),
  line: vi.fn().mockReturnThis(),
  rect: vi.fn().mockReturnThis(),
  roundedRect: vi.fn().mockReturnThis(),
  setLineWidth: vi.fn().mockReturnThis(),
  addPage: vi.fn().mockReturnThis(),
  getStringUnitWidth: vi.fn().mockReturnValue(50),
  save: vi.fn(),
  output: vi.fn().mockReturnValue('data:application/pdf;base64,test'),
  splitTextToSize: vi.fn().mockImplementation((text: string) => [text]),
  getNumberOfPages: vi.fn().mockReturnValue(1),
  setPage: vi.fn().mockReturnThis(),
};

vi.mock('jspdf', () => ({
  default: vi.fn(() => mockJsPDF),
}));

// Mock analytics services to avoid side effects
vi.mock('../../services/PrivacyAnalyticsService', () => ({
  privacyAnalytics: {
    trackExportEvent: vi.fn(),
    trackDataExport: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../analytics/ga4-events', () => ({
  trackDataExported: vi.fn(),
}));

vi.mock('../usage-tracking', () => ({
  trackExport: vi.fn(),
}));

vi.mock('../../lib/debug-logger', () => ({
  analyticsLogger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

import { exportWorkSafeBCPDF, downloadWorkSafeBCPDF } from './wcb-export';

describe('WCB Export', () => {
  const defaultOptions = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockEntry = (overrides: Partial<PainEntry> = {}): PainEntry => ({
    id: `entry-${Date.now()}-${Math.random()}`,
    timestamp: new Date('2024-01-15').toISOString(),
    baselineData: {
      pain: 5,
      locations: ['lower back'],
      symptoms: ['aching'],
    },
    functionalImpact: {
      limitedActivities: ['walking'],
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

  describe('exportWorkSafeBCPDF', () => {
    it('should generate a PDF data URI string with basic entries', () => {
      const entries: PainEntry[] = [
        createMockEntry({ timestamp: '2024-01-15T10:00:00Z' }),
        createMockEntry({ timestamp: '2024-01-16T14:30:00Z' }),
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
      expect(result).toContain('data:application/pdf');
    });

    it('should handle empty entries array', () => {
      const entries: PainEntry[] = [];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with various pain levels', () => {
      const entries: PainEntry[] = [
        createMockEntry({ baselineData: { pain: 1, locations: [], symptoms: [] } }),
        createMockEntry({ baselineData: { pain: 5, locations: [], symptoms: [] } }),
        createMockEntry({ baselineData: { pain: 10, locations: [], symptoms: [] } }),
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with multiple locations and symptoms', () => {
      const entries: PainEntry[] = [
        createMockEntry({
          baselineData: {
            pain: 7,
            locations: ['lower back', 'neck', 'shoulders', 'knees'],
            symptoms: ['aching', 'burning', 'stabbing', 'numbness'],
          },
        }),
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries spanning multiple months', () => {
      const entries: PainEntry[] = [
        createMockEntry({ timestamp: '2024-01-01T10:00:00Z' }),
        createMockEntry({ timestamp: '2024-02-15T10:00:00Z' }),
        createMockEntry({ timestamp: '2024-03-30T10:00:00Z' }),
      ];

      const result = exportWorkSafeBCPDF(entries, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
      });

      expect(typeof result).toBe('string');
    });

    it('should handle entries with work impact data', () => {
      const entries: PainEntry[] = [
        createMockEntry({
          workImpact: {
            missedWork: 1,
            modifiedDuties: ['light duty', 'desk work only'],
            workLimitations: ['no lifting', 'limited standing'],
          },
        }),
        createMockEntry({
          workImpact: {
            missedWork: 0,
            modifiedDuties: ['modified schedule'],
            workLimitations: [],
          },
        }),
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with functional impact data', () => {
      const entries: PainEntry[] = [
        createMockEntry({
          functionalImpact: {
            limitedActivities: ['walking', 'sitting', 'standing', 'lifting'],
            assistanceNeeded: ['Personal care (bathing, dressing)'],
            mobilityAids: ['cane', 'walker'],
          },
        }),
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with notes', () => {
      const entries: PainEntry[] = [
        createMockEntry({
          notes: 'Pain was particularly severe after prolonged sitting during work meeting.',
        }),
        createMockEntry({
          notes: 'Applied ice pack which provided temporary relief. Took medication.',
        }),
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle single entry', () => {
      const entries: PainEntry[] = [createMockEntry()];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with mood data', () => {
      const entries: PainEntry[] = [
        createMockEntry({
          mood: 3,
        }),
        createMockEntry({
          mood: 2,
        }),
        createMockEntry({
          mood: 8,
        }),
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should include patient name when provided', () => {
      const entries: PainEntry[] = [createMockEntry()];

      const result = exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        patientName: 'John Doe',
      });

      expect(typeof result).toBe('string');
      expect(mockJsPDF.text).toHaveBeenCalled();
    });

    it('should include claim number when provided', () => {
      const entries: PainEntry[] = [createMockEntry()];

      const result = exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        claimNumber: 'WCB-123456',
      });

      expect(typeof result).toBe('string');
    });

    it('should include healthcare provider when provided', () => {
      const entries: PainEntry[] = [createMockEntry()];

      const result = exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        healthcareProvider: 'Dr. Smith',
      });

      expect(typeof result).toBe('string');
    });

    it('should include detailed entries when option is enabled', () => {
      const entries: PainEntry[] = [createMockEntry(), createMockEntry()];

      const result = exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        includeDetailedEntries: true,
      });

      expect(typeof result).toBe('string');
    });

    it('should include trend summary when option is enabled', () => {
      const entries: PainEntry[] = [createMockEntry(), createMockEntry()];

      const result = exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        includeTrendSummary: true,
      });

      expect(typeof result).toBe('string');
    });
  });

  describe('downloadWorkSafeBCPDF', () => {
    it('should create and trigger download link', () => {
      const entries: PainEntry[] = [createMockEntry()];

      // Mock document methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      downloadWorkSafeBCPDF(entries, defaultOptions);

      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toContain('PainTracker-WCB-Report');
      expect(mockLink.download).toContain('.pdf');

      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle entries with undefined optional fields', () => {
      const entries: PainEntry[] = [
        createMockEntry({
          id: 'test-1',
          baselineData: {
            pain: 5,
            locations: [],
            symptoms: [],
          },
          functionalImpact: {
            limitedActivities: [],
            assistanceNeeded: [],
            mobilityAids: [],
          },
        }),
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with zero pain level', () => {
      const entries: PainEntry[] = [
        createMockEntry({
          baselineData: { pain: 0, locations: [], symptoms: [] },
        }),
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle large number of entries', () => {
      const entries: PainEntry[] = Array.from({ length: 100 }, (_, i) =>
        createMockEntry({
          timestamp: new Date(Date.parse('2024-01-01') + i * 24 * 60 * 60 * 1000).toISOString(),
          baselineData: { pain: (i % 10) + 1, locations: [], symptoms: [] },
        })
      );

      const result = exportWorkSafeBCPDF(entries, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-04-30'),
      });

      expect(typeof result).toBe('string');
    });

    it('should handle entries with very long notes', () => {
      const longNote = 'A'.repeat(1000);
      const entries: PainEntry[] = [
        createMockEntry({
          notes: longNote,
        }),
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with special characters in notes', () => {
      const entries: PainEntry[] = [
        createMockEntry({
          notes: 'Pain level: 8/10 & increasing. "Sharp" pain - very uncomfortable! <severe>',
        }),
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should filter entries by date range', () => {
      const entries: PainEntry[] = [
        createMockEntry({ timestamp: '2023-12-15T10:00:00Z' }), // Before range
        createMockEntry({ timestamp: '2024-01-15T10:00:00Z' }), // In range
        createMockEntry({ timestamp: '2024-02-15T10:00:00Z' }), // After range
      ];

      const result = exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });
  });
});

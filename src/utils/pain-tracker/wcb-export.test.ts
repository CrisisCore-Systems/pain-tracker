import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PainEntry } from '../../types';
import { privacyAnalytics } from '../../services/PrivacyAnalyticsService';
import { analyticsLogger } from '../../lib/debug-logger';

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

const swallowed = vi.hoisted(() => vi.fn());

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
    swallowed,
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
    it('should generate a PDF data URI string with basic entries', async () => {
      const entries: PainEntry[] = [
        createMockEntry({ timestamp: '2024-01-15T10:00:00Z' }),
        createMockEntry({ timestamp: '2024-01-16T14:30:00Z' }),
      ];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
      expect(result).toContain('data:application/pdf');
    });

    it('should handle empty entries array', async () => {
      const entries: PainEntry[] = [];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with various pain levels', async () => {
      const entries: PainEntry[] = [
        createMockEntry({ baselineData: { pain: 1, locations: [], symptoms: [] } }),
        createMockEntry({ baselineData: { pain: 5, locations: [], symptoms: [] } }),
        createMockEntry({ baselineData: { pain: 10, locations: [], symptoms: [] } }),
      ];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with multiple locations and symptoms', async () => {
      const entries: PainEntry[] = [
        createMockEntry({
          baselineData: {
            pain: 7,
            locations: ['lower back', 'neck', 'shoulders', 'knees'],
            symptoms: ['aching', 'burning', 'stabbing', 'numbness'],
          },
        }),
      ];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries spanning multiple months', async () => {
      const entries: PainEntry[] = [
        createMockEntry({ timestamp: '2024-01-01T10:00:00Z' }),
        createMockEntry({ timestamp: '2024-02-15T10:00:00Z' }),
        createMockEntry({ timestamp: '2024-03-30T10:00:00Z' }),
      ];

      const result = await exportWorkSafeBCPDF(entries, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
      });

      expect(typeof result).toBe('string');
    });

    it('should handle entries with work impact data', async () => {
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

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with functional impact data', async () => {
      const entries: PainEntry[] = [
        createMockEntry({
          functionalImpact: {
            limitedActivities: ['walking', 'sitting', 'standing', 'lifting'],
            assistanceNeeded: ['Personal care (bathing, dressing)'],
            mobilityAids: ['cane', 'walker'],
          },
        }),
      ];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with notes', async () => {
      const entries: PainEntry[] = [
        createMockEntry({
          notes: 'Pain was particularly severe after prolonged sitting during work meeting.',
        }),
        createMockEntry({
          notes: 'Applied ice pack which provided temporary relief. Took medication.',
        }),
      ];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle single entry', async () => {
      const entries: PainEntry[] = [createMockEntry()];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with mood data', async () => {
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

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should include patient name when provided', async () => {
      const entries: PainEntry[] = [createMockEntry()];

      const result = await exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        patientName: 'John Doe',
      });

      expect(typeof result).toBe('string');
      expect(mockJsPDF.text).toHaveBeenCalled();
    });

    it('should include claim number when provided', async () => {
      const entries: PainEntry[] = [createMockEntry()];

      const result = await exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        claimNumber: 'WCB-123456',
      });

      expect(typeof result).toBe('string');
    });

    it('should include healthcare provider when provided', async () => {
      const entries: PainEntry[] = [createMockEntry()];

      const result = await exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        healthcareProvider: 'Dr. Smith',
      });

      expect(typeof result).toBe('string');
    });

    it('should include detailed entries when option is enabled', async () => {
      const entries: PainEntry[] = [createMockEntry(), createMockEntry()];

      const result = await exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        includeDetailedEntries: true,
      });

      expect(typeof result).toBe('string');
    });

    it('should include trend summary when option is enabled', async () => {
      const entries: PainEntry[] = [createMockEntry(), createMockEntry()];

      const result = await exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        includeTrendSummary: true,
      });

      expect(typeof result).toBe('string');
    });

    it('covers pain trend branches: stable', async () => {
      const entries: PainEntry[] = Array.from({ length: 14 }, (_, i) =>
        createMockEntry({
          timestamp: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
          baselineData: { pain: i < 7 ? 5 : 5.2, locations: [], symptoms: [] },
        })
      );

      await exportWorkSafeBCPDF(entries, defaultOptions);

      const calls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      expect(JSON.stringify(calls)).toContain('stable');
    });

    it('covers pain trend branches: slightly worsening', async () => {
      const entries: PainEntry[] = Array.from({ length: 14 }, (_, i) =>
        createMockEntry({
          timestamp: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
          baselineData: { pain: i < 7 ? 4 : 4.8, locations: [], symptoms: [] },
        })
      );

      await exportWorkSafeBCPDF(entries, defaultOptions);

      const calls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      expect(JSON.stringify(calls)).toContain('slightly worsening');
    });

    it('covers pain trend branches: significantly worsening', async () => {
      const entries: PainEntry[] = Array.from({ length: 14 }, (_, i) =>
        createMockEntry({
          timestamp: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
          baselineData: { pain: i < 7 ? 3 : 6, locations: [], symptoms: [] },
        })
      );

      await exportWorkSafeBCPDF(entries, defaultOptions);

      const calls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      expect(JSON.stringify(calls)).toContain('significantly worsening');
    });

    it('covers pain trend branches: slightly improving', async () => {
      const entries: PainEntry[] = Array.from({ length: 14 }, (_, i) =>
        createMockEntry({
          timestamp: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
          baselineData: { pain: i < 7 ? 6 : 5.3, locations: [], symptoms: [] },
        })
      );

      await exportWorkSafeBCPDF(entries, defaultOptions);

      const calls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      expect(JSON.stringify(calls)).toContain('slightly improving');
    });

    it('covers pain trend branches: significantly improving', async () => {
      const entries: PainEntry[] = Array.from({ length: 14 }, (_, i) =>
        createMockEntry({
          timestamp: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
          baselineData: { pain: i < 7 ? 8 : 5, locations: [], symptoms: [] },
        })
      );

      await exportWorkSafeBCPDF(entries, defaultOptions);

      const calls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      expect(JSON.stringify(calls)).toContain('significantly improving');
    });

    it('covers pain trend branch: requires at least 2 weeks of data', async () => {
      const entries: PainEntry[] = Array.from({ length: 5 }, (_, i) =>
        createMockEntry({
          timestamp: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`).toISOString(),
          baselineData: { pain: 5, locations: [], symptoms: [] },
        })
      );

      await exportWorkSafeBCPDF(entries, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      const calls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      expect(JSON.stringify(calls)).toContain('at least 2 weeks');
    });

    it('renders trend summary when enough points exist (including same-day aggregation)', async () => {
      const entries: PainEntry[] = [
        // Two entries on the same day to hit the aggregation path in toDailyAveragePain
        createMockEntry({ timestamp: '2024-01-01T08:00:00Z', baselineData: { pain: 4, locations: [], symptoms: [] } }),
        createMockEntry({ timestamp: '2024-01-01T18:00:00Z', baselineData: { pain: 6, locations: [], symptoms: [] } }),
        createMockEntry({ timestamp: '2024-01-02T10:00:00Z', baselineData: { pain: 5, locations: [], symptoms: [] } }),
        createMockEntry({ timestamp: '2024-01-03T10:00:00Z', baselineData: { pain: 5, locations: [], symptoms: [] } }),
      ];

      await exportWorkSafeBCPDF(entries, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        includeTrendSummary: true,
      });

      // If mini-bars rendered, rect() should be called for the frame and bars.
      expect(mockJsPDF.rect).toHaveBeenCalled();
    });

    it('adds a truncation line when there are more than 25 detailed entries', async () => {
      const entries: PainEntry[] = Array.from({ length: 30 }, (_, i) =>
        createMockEntry({
          timestamp: new Date(Date.parse('2024-01-01T10:00:00Z') + i * 24 * 60 * 60 * 1000).toISOString(),
          baselineData: { pain: 5, locations: [], symptoms: [] },
          notes: `note-${i}`,
        })
      );

      await exportWorkSafeBCPDF(entries, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-15'),
        includeDetailedEntries: true,
      });

      const calls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      expect(JSON.stringify(calls)).toContain('... and 5 more entries');
    });

    it('covers treatment effectiveness summary when reports exist', async () => {
      const entries: PainEntry[] = [
        createMockEntry({
          treatments: { recent: [], effectiveness: 'helped', planned: [] },
        }),
      ];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);
      expect(typeof result).toBe('string');
    });

    it('covers pain severity branch: moderately severe (pain=6)', async () => {
      const entries: PainEntry[] = [
        createMockEntry({
          baselineData: { pain: 6, locations: [], symptoms: [] },
        }),
      ];

      await exportWorkSafeBCPDF(entries, defaultOptions);

      const calls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      expect(JSON.stringify(calls)).toContain('Moderately Severe');
    });

    it('covers pain severity branch: moderate (pain=4)', async () => {
      const entries: PainEntry[] = [
        createMockEntry({
          baselineData: { pain: 4, locations: [], symptoms: [] },
        }),
      ];

      await exportWorkSafeBCPDF(entries, defaultOptions);

      const calls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      expect(JSON.stringify(calls)).toContain('Moderate');
    });

    it('covers detailed entries notes fallback (notes undefined vs present)', async () => {
      const entries: PainEntry[] = [
        createMockEntry({
          timestamp: '2024-01-10T10:00:00Z',
          notes: undefined as any,
        }),
        createMockEntry({
          timestamp: '2024-01-11T10:00:00Z',
          notes: 'some notes',
        }),
      ];

      await exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        includeDetailedEntries: true,
      });

      const calls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      expect(JSON.stringify(calls)).toContain('some notes');
    });

    it('covers detailed entries locations fallback (locations undefined)', async () => {
      const entries: PainEntry[] = [
        createMockEntry({
          timestamp: '2024-01-10T10:00:00Z',
          baselineData: { pain: 5 } as any,
        }),
      ];

      await exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        includeDetailedEntries: true,
      });

      expect(mockJsPDF.output).toHaveBeenCalled();
    });

    it('swallows analytics tracking failures (trackDataExport catch)', async () => {
      const mod = await import('../../services/PrivacyAnalyticsService');
      (mod.privacyAnalytics.trackDataExport as any).mockRejectedValueOnce(new Error('down'));

      await exportWorkSafeBCPDF([createMockEntry()], defaultOptions);

      await Promise.resolve();
      await Promise.resolve();

      expect(swallowed).toHaveBeenCalled();
    });

    it('covers pain severity labels: Severe and Extreme', async () => {
      await exportWorkSafeBCPDF(
        [
          createMockEntry({ baselineData: { pain: 8, locations: [], symptoms: [] } }),
          createMockEntry({ baselineData: { pain: 8, locations: [], symptoms: [] } }),
        ],
        defaultOptions
      );

      const severeCalls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      const severeText = JSON.stringify(severeCalls).toLowerCase();
      expect(severeText).toContain('severe');

      vi.clearAllMocks();

      await exportWorkSafeBCPDF(
        [
          createMockEntry({ baselineData: { pain: 9, locations: [], symptoms: [] } }),
          createMockEntry({ baselineData: { pain: 9, locations: [], symptoms: [] } }),
        ],
        defaultOptions
      );

      const extremeCalls = (mockJsPDF.text as unknown as { mock: { calls: unknown[][] } }).mock.calls;
      const extremeText = JSON.stringify(extremeCalls).toLowerCase();
      expect(extremeText).toContain('extreme');
    });

    it('covers detailed entries alternate-row shading', async () => {
      const entries: PainEntry[] = [
        createMockEntry({ timestamp: '2024-01-10T10:00:00Z' }),
        createMockEntry({ timestamp: '2024-01-11T10:00:00Z' }),
      ];

      await exportWorkSafeBCPDF(entries, {
        ...defaultOptions,
        includeDetailedEntries: true,
      });

      expect(mockJsPDF.setFillColor).toHaveBeenCalledWith(248, 250, 252);
      expect(mockJsPDF.rect).toHaveBeenCalled();
    });
  });

  describe('downloadWorkSafeBCPDF', () => {
    it('should create and trigger download link', async () => {
      const entries: PainEntry[] = [createMockEntry()];

      // Mock document methods
      const originalCreateElement = document.createElement.bind(document);
      const mockLink = originalCreateElement('a');
      const clickSpy = vi.spyOn(mockLink, 'click').mockImplementation(() => {});

      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node: Node) => node);
      const removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation((node: Node) => node);

      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string, options?: ElementCreationOptions) => {
          if (tagName.toLowerCase() === 'a') return mockLink;
          return originalCreateElement(tagName, options);
        });

      await downloadWorkSafeBCPDF(entries, defaultOptions);

      expect(clickSpy).toHaveBeenCalled();
      expect(mockLink.download).toContain('PainTracker-WCB-Report');
      expect(mockLink.download).toContain('.pdf');

      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      createElementSpy.mockRestore();
      clickSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle entries with undefined optional fields', async () => {
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

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with zero pain level', async () => {
      const entries: PainEntry[] = [
        createMockEntry({
          baselineData: { pain: 0, locations: [], symptoms: [] },
        }),
      ];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle large number of entries', async () => {
      const entries: PainEntry[] = Array.from({ length: 100 }, (_, i) =>
        createMockEntry({
          timestamp: new Date(Date.parse('2024-01-01') + i * 24 * 60 * 60 * 1000).toISOString(),
          baselineData: { pain: (i % 10) + 1, locations: [], symptoms: [] },
        })
      );

      const result = await exportWorkSafeBCPDF(entries, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-04-30'),
      });

      expect(typeof result).toBe('string');
    });

    it('should handle entries with very long notes', async () => {
      const longNote = 'A'.repeat(1000);
      const entries: PainEntry[] = [
        createMockEntry({
          notes: longNote,
        }),
      ];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should handle entries with special characters in notes', async () => {
      const entries: PainEntry[] = [
        createMockEntry({
          notes: 'Pain level: 8/10 & increasing. "Sharp" pain - very uncomfortable! <severe>',
        }),
      ];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });

    it('should filter entries by date range', async () => {
      const entries: PainEntry[] = [
        createMockEntry({ timestamp: '2023-12-15T10:00:00Z' }), // Before range
        createMockEntry({ timestamp: '2024-01-15T10:00:00Z' }), // In range
        createMockEntry({ timestamp: '2024-02-15T10:00:00Z' }), // After range
      ];

      const result = await exportWorkSafeBCPDF(entries, defaultOptions);

      expect(typeof result).toBe('string');
    });
  });

  describe('Trend Analysis Coverage', () => {
    const createTrendEntries = (recentPain: number, oldPain: number): PainEntry[] => {
        const entries: PainEntry[] = [];
        // create 7 older entries
        for (let i = 0; i < 7; i++) {
            entries.push(createMockEntry({
                timestamp: new Date(2024, 0, i + 1).toISOString(),
                baselineData: { pain: oldPain, locations: [], symptoms: [] }
            } as any));
        }
        // create 7 recent entries
        for (let i = 0; i < 7; i++) {
            entries.push(createMockEntry({
                timestamp: new Date(2024, 0, i + 8).toISOString(),
                baselineData: { pain: recentPain, locations: [], symptoms: [] }
            } as any));
        }
        return entries;
    };


    const getAllText = () => (mockJsPDF.text as any).mock.calls.flat().map((arg: any) => {
        if (typeof arg === 'string') return arg;
        if (Array.isArray(arg)) return arg.join(' ');
        return '';
    }).join(' ');

    it('should identify stable trend', async () => {
        const entries = createTrendEntries(5, 5);
        await exportWorkSafeBCPDF(entries, defaultOptions);
        expect(getAllText().toLowerCase()).toContain('stable');
    });

    it('should identify significantly worsening trend', async () => {
        const entries = createTrendEntries(5, 2);
        await exportWorkSafeBCPDF(entries, defaultOptions);
        expect(getAllText().toLowerCase()).toContain('significantly worsening');
    });

    it('should identify slightly worsening trend', async () => {
        const entries = createTrendEntries(5, 4);
        await exportWorkSafeBCPDF(entries, defaultOptions);
        expect(getAllText().toLowerCase()).toContain('slightly worsening');
    });

    it('should identify significantly improving trend', async () => {
        const entries = createTrendEntries(2, 5);
        await exportWorkSafeBCPDF(entries, defaultOptions);
        expect(getAllText().toLowerCase()).toContain('significantly improving');
    });

    it('should identify slightly improving trend', async () => {
        const entries = createTrendEntries(4, 5);
        await exportWorkSafeBCPDF(entries, defaultOptions);
        expect(getAllText().toLowerCase()).toContain('slightly improving');
    });

    it('should handle insufficient data for trend', async () => {
        const entries = [createMockEntry()];
        await exportWorkSafeBCPDF(entries, defaultOptions);
        expect(getAllText().toLowerCase()).toContain('insufficient data for trend analysis');
    });

    it('should handle missing older data for trend', async () => {
        const entries = Array.from({length: 7}, () => createMockEntry());
        await exportWorkSafeBCPDF(entries, defaultOptions);
        expect(getAllText().toLowerCase()).toContain('trend analysis requires at least 2 weeks of data');
    });
  });

  describe('Treatment Effectiveness Coverage', () => {
    it('should process entries with missing effectiveness (branch coverage)', async () => {
        const entries = [createMockEntry({ treatments: undefined })];
        await exportWorkSafeBCPDF(entries, defaultOptions);
    });

    it('should process entries with effectiveness data (branch coverage)', async () => {
        const entries = [createMockEntry({ treatments: { effectiveness: 'Good', recent: [], planned: [] } })];
        await exportWorkSafeBCPDF(entries, defaultOptions);
    });
  });

  describe('Analytics Error Handling', () => {
    it('should swallow analytics errors', async () => {
       const error = new Error('Analytics failed');
       vi.mocked(privacyAnalytics.trackDataExport).mockRejectedValueOnce(error);
       
       await exportWorkSafeBCPDF([], defaultOptions);
       await new Promise(resolve => setTimeout(resolve, 0));

       expect(analyticsLogger.swallowed).toHaveBeenCalledWith(error, expect.objectContaining({
         context: 'exportWorkSafeBCPDF'
       }));
    });
  });
});

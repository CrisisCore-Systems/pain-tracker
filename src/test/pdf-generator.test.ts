import { vi } from 'vitest';
import { generateWCBReportPDF } from '../utils/pdf-generator';
import type { WCBReport } from '../types';

// Mock jsPDF save function by spying on it using Vitest's vi
const { MockJsPDF } = vi.hoisted(() => {
  const mockDoc = {
    setFontSize: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    addPage: vi.fn().mockReturnThis(),
    getNumberOfPages: vi.fn().mockReturnValue(1),
    setPage: vi.fn().mockReturnThis(),
    splitTextToSize: vi.fn((text: string) => [text]),
    save: vi.fn(),
  };

  function MockJsPDF() {
    return mockDoc;
  }

  return { MockJsPDF };
});

vi.mock('jspdf', () => {
  return {
    default: MockJsPDF,
    jsPDF: MockJsPDF,
  };
});

describe('PDF generator', () => {
  it('generates a WCB PDF without throwing', async () => {
    const report: WCBReport = {
      id: 'test-report-1',
      createdAt: new Date('2025-02-01').toISOString(),
      period: {
        start: new Date('2025-01-01').toISOString(),
        end: new Date('2025-01-31').toISOString(),
      },
      claimInfo: { claimNumber: 'DRAFT-1', injuryDate: new Date().toISOString() },
      painTrends: {
        average: 5,
        progression: [
          {
            date: new Date().toISOString(),
            pain: 5,
            locations: ['lower back'],
            symptoms: [],
          },
        ],
        locations: { 'lower back': 3 },
      },
      workImpact: { missedDays: 2, limitations: [['Lifting', 1]], accommodationsNeeded: [] },
      functionalAnalysis: {
        limitations: [],
        deterioration: [],
        improvements: [],
      },
      treatments: {
        current: [{ treatment: 'Physio', frequency: 4 }],
        effectiveness: 'moderate',
      },
      recommendations: ['Increase rest periods', 'Consider graded activity'],
    };

    await expect(generateWCBReportPDF(report)).resolves.not.toThrow();
  });
});

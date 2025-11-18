import { vi } from 'vitest';
import { generateWCBReportPDF } from '../utils/pdf-generator';
import type { WCBReport } from '../types';

// Mock jsPDF save function by spying on it using Vitest's vi
vi.mock('jspdf', () => {
  return {
    jsPDF: vi.fn().mockImplementation(() => ({
      setFontSize: vi.fn(),
      text: vi.fn(),
      addPage: vi.fn(),
      getNumberOfPages: vi.fn().mockReturnValue(1),
      setPage: vi.fn(),
      splitTextToSize: vi.fn((text: string) => [text]),
      save: vi.fn(),
    })),
  } as any;
});

describe('PDF generator', () => {
  it('generates a WCB PDF without throwing', async () => {
    const report: WCBReport = {
      claimInfo: { claimNumber: 'DRAFT-1', injuryDate: new Date().toISOString() },
      painTrends: { average: 5, locations: { 'lower back': 3 } },
      workImpact: { missedDays: 2, limitations: [['Lifting', 1]] as any, accommodationsNeeded: [] },
      treatments: {
        current: [{ treatment: 'Physio', frequency: 4 }],
        effectiveness: 'moderate',
      } as any,
      recommendations: ['Increase rest periods', 'Consider graded activity'],
    } as unknown as WCBReport;

    await expect(generateWCBReportPDF(report)).resolves.not.toThrow();
  });
});

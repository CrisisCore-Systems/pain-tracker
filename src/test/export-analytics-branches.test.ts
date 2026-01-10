import { describe, it, expect, vi, beforeEach } from 'vitest';

const trackDataExport = vi.fn();
const swallowed = vi.fn();

vi.mock('jspdf', () => {
  const doc = {
    setFontSize: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    addPage: vi.fn().mockReturnThis(),
    splitTextToSize: vi.fn().mockImplementation((text: string) => [text]),
    getNumberOfPages: vi.fn().mockReturnValue(1),
    setPage: vi.fn().mockReturnThis(),
    output: vi.fn().mockReturnValue('data:application/pdf;base64,test'),
  };
  return {
    default: vi.fn(() => doc),
  };
});

vi.mock('../services/PrivacyAnalyticsService', () => ({
  privacyAnalytics: {
    trackDataExport,
  },
}));

vi.mock('../analytics/ga4-events', () => ({
  trackDataExported: vi.fn(),
}));

vi.mock('../utils/usage-tracking', () => ({
  trackExport: vi.fn(),
}));

vi.mock('../lib/debug-logger', () => ({
  analyticsLogger: {
    swallowed,
  },
}));

describe('export.ts analytics catch branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('swallows PrivacyAnalyticsService failures in exportToCSV/exportToJSON', async () => {
    trackDataExport.mockRejectedValueOnce(new Error('csv down'));
    trackDataExport.mockRejectedValueOnce(new Error('json down'));

    const { exportToCSV, exportToJSON } = await import('../utils/pain-tracker/export');

    exportToCSV([
      {
        id: 1,
        timestamp: '2024-01-01T08:00:00Z',
        baselineData: { pain: 5, locations: [], symptoms: [] },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: '',
      } as any,
    ]);

    exportToJSON([] as any);

    // Allow the rejected promise catch handlers to run.
    await Promise.resolve();
    await Promise.resolve();

    expect(swallowed).toHaveBeenCalled();
  });

  it('swallows PrivacyAnalyticsService failures in exportToPDF', async () => {
    trackDataExport.mockRejectedValueOnce(new Error('pdf down'));

    const { exportToPDF } = await import('../utils/pain-tracker/export');

    await exportToPDF([] as any);

    await Promise.resolve();
    await Promise.resolve();

    expect(swallowed).toHaveBeenCalled();
  });

  it('handles data URI path in downloadData', async () => {
    const { downloadData } = await import('../utils/pain-tracker/export');

    const createObjectURL = vi.fn(() => 'blob:mock');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(window, 'URL', {
      value: { createObjectURL, revokeObjectURL },
      writable: true,
    });

    const click = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation(
      () => ({ href: '', download: '', click } as unknown as HTMLElement),
    );

    const appendChild = vi.fn();
    const removeChild = vi.fn();
    Object.defineProperty(document, 'body', {
      value: { appendChild, removeChild },
      writable: true,
    });

    downloadData('data:text/plain;base64,SGVsbG8=', 'hello.txt');

    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });
});

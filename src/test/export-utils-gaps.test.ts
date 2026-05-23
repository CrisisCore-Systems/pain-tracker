import { describe, it, expect, vi } from 'vitest';
import { exportToCSV, downloadData, clearExportArtifacts } from '../utils/pain-tracker/export';
import type { PainEntry } from '../types';

const sample: PainEntry = {
  id: 1,
  timestamp: '2025-09-17T12:34:56Z',
  baselineData: { pain: 5, locations: ['shoulder'], symptoms: ['"sharp" pain'] },
  functionalImpact: { limitedActivities: ['lift'], assistanceNeeded: [], mobilityAids: [] },
  medications: { current: [], changes: '', effectiveness: '' },
  treatments: { recent: [], effectiveness: '', planned: [] },
  qualityOfLife: { sleepQuality: 6, moodImpact: 4, socialImpact: [] },
  workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
  comparison: { worseningSince: '', newLimitations: [] },
  notes: 'Contains "quotes", commas, and newline\nsecond line',
};

describe('export utils gaps', () => {
  it('exports CSV with proper escaping', () => {
    const csv = exportToCSV([sample]);
    // Should contain escaped quotes doubled inside field
    expect(csv).toMatch(/Contains ""quotes""/);
    // Timestamp split into date + time
    expect(csv).toMatch(/2025-09-17,12:34/);
  });

  it('downloadData creates and cleans link', () => {
    if (!window.URL.revokeObjectURL) {
      (window.URL as unknown as { revokeObjectURL: (u?: string) => void }).revokeObjectURL =
        () => {};
    }
    if (!window.URL.createObjectURL) {
      (window.URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL = () =>
        'blob:temp';
    }
    const revokeSpy = vi.spyOn(window.URL, 'revokeObjectURL');
    const createSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:fake');
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const originalCreateElement = document.createElement.bind(document);
    const anchor = originalCreateElement('a');
    const click = vi.spyOn(anchor, 'click').mockImplementation(() => undefined);
    const remove = vi.spyOn(anchor, 'remove').mockImplementation(() => undefined);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return anchor;
      }

      return originalCreateElement(tagName);
    });

    downloadData('test', 'file.txt');
    clearExportArtifacts();

    expect(createSpy).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalled();
  });
});

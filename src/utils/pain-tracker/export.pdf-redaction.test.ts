/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PainEntry } from '../../types';

const textCalls: string[] = [];

class MockJsPDF {
  private pageCount = 1;

  public setFontSize = vi.fn();
  public addPage = vi.fn(() => {
    this.pageCount += 1;
  });
  public setPage = vi.fn();
  public splitTextToSize = vi.fn((text: string) => [text]);
  public getNumberOfPages = vi.fn(() => this.pageCount);
  public output = vi.fn(() => 'data:application/pdf;base64,JVBERi0xLjQ=');

  public text = vi.fn((content: string | string[]) => {
    if (Array.isArray(content)) {
      textCalls.push(...content.map(String));
      return;
    }

    textCalls.push(String(content));
  });
}

vi.mock('jspdf', () => ({
  default: MockJsPDF,
}));

vi.mock('../../services/PrivacyAnalyticsService', () => ({
  privacyAnalytics: {
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
    swallowed: vi.fn(),
  },
}));

import { exportToPDF } from './export';

function createEntry(): PainEntry {
  return {
    id: 1,
    timestamp: '2024-01-01T08:00:00Z',
    baselineData: {
      pain: 5,
      locations: ['Lower Back'],
      symptoms: ['Burning'],
    },
    functionalImpact: {
      limitedActivities: [],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [
        {
          name: 'Ibuprofen',
          dosage: '200mg',
          frequency: 'BID',
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
    notes: 'Private note that should be removed in minimal PDF exports.',
  };
}

describe('PDF redaction policy', () => {
  beforeEach(() => {
    textCalls.length = 0;
    vi.clearAllMocks();
  });

  it('omits notes and locations and shows redacted marker for minimal policy', async () => {
    await exportToPDF([createEntry()], 'minimal');

    const renderedText = textCalls.join('\n');

    expect(renderedText).toContain('Redacted/Minimal Export');
    expect(renderedText).toContain('Symptoms: Burning');
    expect(renderedText).toContain('Medication Log: Ibuprofen (200mg, BID)');
    expect(renderedText).not.toContain('Notes: Private note');
    expect(renderedText).not.toContain('Locations: Lower Back');
  });

  it('includes notes and locations for full policy', async () => {
    await exportToPDF([createEntry()], 'full');

    const renderedText = textCalls.join('\n');

    expect(renderedText).not.toContain('Redacted/Minimal Export');
    expect(renderedText).toContain('Locations: Lower Back');
    expect(renderedText).toContain('Notes: Private note that should be removed in minimal PDF exports.');
  });
});

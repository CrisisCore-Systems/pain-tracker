/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { exportToCSV, exportToJSON, downloadData } from './export';
import type { PainEntry } from '../../types';

describe('Pain Tracker Export', () => {
  const mockEntries: PainEntry[] = [
    {
      id: 1,
      timestamp: '2024-01-01T08:00:00Z',
      baselineData: {
        pain: 5,
        locations: ['Lower Back', 'Neck'],
        symptoms: ['Stiffness', 'Burning']
      },
      functionalImpact: {
        limitedActivities: ['Walking', 'Sitting'],
        assistanceNeeded: [],
        mobilityAids: []
      },
      medications: {
        current: [],
        changes: '',
        effectiveness: ''
      },
      treatments: {
        recent: [],
        effectiveness: '',
        planned: []
      },
      qualityOfLife: {
        sleepQuality: 6,
        moodImpact: 5,
        socialImpact: []
      },
      workImpact: {
        missedWork: 0,
        modifiedDuties: [],
        workLimitations: []
      },
      comparison: {
        worseningSince: '',
        newLimitations: []
      },
      notes: 'Test note'
    }
  ];

  describe('exportToCSV', () => {
    it('should generate correct CSV format', () => {
      const csv = exportToCSV(mockEntries);
      expect(csv).toContain('Date,Time,Pain Level,Locations,Symptoms');
      expect(csv).toContain('2024-01-01,08:00,5,"Lower Back; Neck","Stiffness; Burning"');
    });

    it('should handle empty entries', () => {
      const csv = exportToCSV([]);
      expect(csv).toContain('Date,Time,Pain Level,Locations,Symptoms');
      expect(csv.split('\\n')).toHaveLength(1); // Only headers
    });

    it('should escape quotes in notes', () => {
      const entriesWithQuotes = [{
        ...mockEntries[0],
        notes: 'Test "quoted" note'
      }];
      const csv = exportToCSV(entriesWithQuotes);
      expect(csv).toContain('"Test ""quoted"" note"');
    });
  });

  describe('exportToJSON', () => {
    it('should generate valid JSON', () => {
      const json = exportToJSON(mockEntries);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should preserve all data', () => {
      const json = exportToJSON(mockEntries);
      const parsed = JSON.parse(json);
      expect(parsed).toEqual(mockEntries);
    });
  });

  describe('downloadData', () => {
    let originalWindow: typeof window;

    beforeEach(() => {
      originalWindow = { ...window };
      
      // Mock URL methods
      const mockURL = {
        createObjectURL: vi.fn(() => 'mock-url'),
        revokeObjectURL: vi.fn()
      };

      Object.defineProperty(window, 'URL', {
        value: mockURL,
        writable: true
      });

      // Mock document methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };

      vi.spyOn(document, 'createElement').mockImplementation(() => mockLink as unknown as HTMLElement);

      const mockBody = {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      };

      Object.defineProperty(document, 'body', {
        value: mockBody,
        writable: true
      });
    });

    afterEach(() => {
      // Restore original window
      Object.defineProperty(window, 'URL', {
        value: originalWindow.URL,
        writable: true
      });
      vi.restoreAllMocks();
    });

    it('should create and trigger download link', () => {
      downloadData('test data', 'test.csv');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });
}); 
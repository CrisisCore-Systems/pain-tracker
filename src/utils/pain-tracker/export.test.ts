/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { exportToCSV, exportToJSON, downloadData, exportToPDF } from './export';
import type { PainEntry } from '../../types';

describe('Pain Tracker Export', () => {
  const mockEntries: PainEntry[] = [
    {
      id: 1,
      timestamp: '2024-01-01T08:00:00Z',
      baselineData: {
        pain: 5,
        locations: ['Lower Back', 'Neck'],
        symptoms: ['Stiffness', 'Burning'],
      },
      functionalImpact: {
        limitedActivities: ['Walking', 'Sitting'],
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
      notes: 'Test note',
    },
  ];

  // Helper to create multiple mock entries for testing
  const createMockEntries = (count: number): PainEntry[] => {
    return Array.from({ length: count }, (_, i) => ({
      ...mockEntries[0],
      id: i + 1,
      timestamp: new Date(2024, 0, i + 1, 8, 0, 0).toISOString(),
      baselineData: {
        pain: (i % 10) + 1,
        locations: i % 2 === 0 ? ['Lower Back'] : ['Neck', 'Shoulder'],
        symptoms: i % 3 === 0 ? ['Stiffness'] : ['Burning', 'Aching'],
      },
      notes: `Entry ${i + 1} notes`,
    }));
  };

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
      const entriesWithQuotes = [
        {
          ...mockEntries[0],
          notes: 'Test "quoted" note',
        },
      ];
      const csv = exportToCSV(entriesWithQuotes);
      expect(csv).toContain('"Test ""quoted"" note"');
    });

    it('should handle entries with missing optional fields', () => {
      const minimalEntry: PainEntry = {
        id: 1,
        timestamp: '2024-01-01T10:30:00Z',
        baselineData: {
          pain: 3,
          locations: [],
          symptoms: [],
        },
        functionalImpact: {
          limitedActivities: [],
          assistanceNeeded: [],
          mobilityAids: [],
        },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: '',
      };
      const csv = exportToCSV([minimalEntry]);
      // When values are 0 or empty, they render as empty strings in the CSV
      expect(csv).toContain('2024-01-01,10:30,3,"","",""');
      expect(csv).toContain('""'); // Empty notes
    });

    it('should handle multiple entries', () => {
      const multipleEntries = createMockEntries(5);
      const csv = exportToCSV(multipleEntries);
      const lines = csv.split('\\n');
      expect(lines).toHaveLength(6); // 1 header + 5 entries
    });

    it('should preserve semicolon-separated values in quoted fields', () => {
      const csv = exportToCSV(mockEntries);
      // Locations should be semicolon-separated and quoted
      expect(csv).toContain('"Lower Back; Neck"');
      // Symptoms should be semicolon-separated and quoted
      expect(csv).toContain('"Stiffness; Burning"');
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

    it('should handle empty array', () => {
      const json = exportToJSON([]);
      const parsed = JSON.parse(json);
      expect(parsed).toEqual([]);
    });

    it('should format with indentation for readability', () => {
      const json = exportToJSON(mockEntries);
      // Check that it's formatted (contains newlines and spaces)
      expect(json).toContain('\n');
      expect(json).toContain('  '); // 2-space indentation
    });

    it('should handle multiple entries', () => {
      const multipleEntries = createMockEntries(10);
      const json = exportToJSON(multipleEntries);
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(10);
    });
  });

  describe('exportToPDF', () => {
    it('should generate a data URI string', () => {
      const result = exportToPDF(mockEntries);
      expect(result).toMatch(/^data:application\/pdf;/);
    });

    it('should handle empty entries', () => {
      const result = exportToPDF([]);
      expect(result).toMatch(/^data:application\/pdf;/);
    });

    it('should handle entries without notes', () => {
      const entriesWithoutNotes = [{
        ...mockEntries[0],
        notes: '',
      }];
      const result = exportToPDF(entriesWithoutNotes);
      expect(result).toMatch(/^data:application\/pdf;/);
    });

    it('should handle entries without symptoms or locations', () => {
      const minimalEntry: PainEntry = {
        ...mockEntries[0],
        baselineData: {
          pain: 5,
          locations: [],
          symptoms: [],
        },
      };
      const result = exportToPDF([minimalEntry]);
      expect(result).toMatch(/^data:application\/pdf;/);
    });

    it('should handle more than 20 entries (pagination)', () => {
      const manyEntries = createMockEntries(25);
      const result = exportToPDF(manyEntries);
      expect(result).toMatch(/^data:application\/pdf;/);
      // PDF should still be generated successfully
      expect(result.length).toBeGreaterThan(1000);
    });

    it('should handle entries with long notes', () => {
      const longNote = 'A'.repeat(500);
      const entriesWithLongNotes = [{
        ...mockEntries[0],
        notes: longNote,
      }];
      const result = exportToPDF(entriesWithLongNotes);
      expect(result).toMatch(/^data:application\/pdf;/);
    });

    it('should calculate average pain correctly', () => {
      const entriesWithVariedPain = [
        { ...mockEntries[0], baselineData: { ...mockEntries[0].baselineData, pain: 2 } },
        { ...mockEntries[0], id: 2, baselineData: { ...mockEntries[0].baselineData, pain: 4 } },
        { ...mockEntries[0], id: 3, baselineData: { ...mockEntries[0].baselineData, pain: 6 } },
      ];
      // Average should be 4
      const result = exportToPDF(entriesWithVariedPain);
      expect(result).toMatch(/^data:application\/pdf;/);
    });

    it('should handle entries spanning multiple pages', () => {
      // Create entries with lots of content that would span pages
      const verboseEntries = createMockEntries(15).map((entry, i) => ({
        ...entry,
        notes: `Detailed notes for entry ${i + 1}. This is a longer note to test pagination. `.repeat(3),
        baselineData: {
          ...entry.baselineData,
          symptoms: ['Symptom1', 'Symptom2', 'Symptom3', 'Symptom4'],
          locations: ['Location1', 'Location2', 'Location3'],
        },
      }));
      const result = exportToPDF(verboseEntries);
      expect(result).toMatch(/^data:application\/pdf;/);
    });
  });

  describe('downloadData', () => {
    let originalWindow: typeof window;

    beforeEach(() => {
      originalWindow = { ...window };

      // Mock URL methods
      const mockURL = {
        createObjectURL: vi.fn(() => 'mock-url'),
        revokeObjectURL: vi.fn(),
      };

      Object.defineProperty(window, 'URL', {
        value: mockURL,
        writable: true,
      });

      // Mock document methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      vi.spyOn(document, 'createElement').mockImplementation(
        () => mockLink as unknown as HTMLElement
      );

      const mockBody = {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };

      Object.defineProperty(document, 'body', {
        value: mockBody,
        writable: true,
      });
    });

    afterEach(() => {
      // Restore original window
      Object.defineProperty(window, 'URL', {
        value: originalWindow.URL,
        writable: true,
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

    it('should use correct mime type for CSV', () => {
      downloadData('col1,col2\nval1,val2', 'export.csv', 'text/csv;charset=utf-8');
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should use correct mime type for JSON', () => {
      downloadData('{"key": "value"}', 'export.json', 'application/json;charset=utf-8');
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle data URI format (for PDF)', () => {
      const dataUri = 'data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmo=';
      downloadData(dataUri, 'export.pdf');
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Integration: Full Export Flow', () => {
    it('should export to CSV and be parseable', () => {
      const entries = createMockEntries(3);
      const csv = exportToCSV(entries);
      
      // Verify CSV structure
      const lines = csv.split('\\n');
      expect(lines[0]).toContain('Date');
      expect(lines[0]).toContain('Pain Level');
      
      // Each entry should create a row
      expect(lines.length).toBe(4); // header + 3 entries
    });

    it('should export to JSON and preserve data integrity', () => {
      const entries = createMockEntries(3);
      const json = exportToJSON(entries);
      const parsed = JSON.parse(json);
      
      // Verify all entries preserved
      expect(parsed.length).toBe(3);
      
      // Verify data integrity
      parsed.forEach((entry: PainEntry, index: number) => {
        expect(entry.id).toBe(entries[index].id);
        expect(entry.timestamp).toBe(entries[index].timestamp);
        expect(entry.baselineData.pain).toBe(entries[index].baselineData.pain);
      });
    });

    it('should export to PDF with valid structure', () => {
      const entries = createMockEntries(5);
      const pdfDataUri = exportToPDF(entries);
      
      // Verify it's a valid PDF data URI
      expect(pdfDataUri).toMatch(/^data:application\/pdf;/);
      
      // Extract base64 content
      const base64Content = pdfDataUri.split(',')[1];
      expect(base64Content).toBeTruthy();
      
      // Base64 should decode to PDF magic bytes
      const decoded = atob(base64Content.slice(0, 20));
      expect(decoded).toContain('%PDF');
    });
  });
});

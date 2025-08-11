import { describe, it, expect } from 'vitest';
import { validatePainEntry, validateWCBReport, PainEntrySchema, WCBReportSchema } from '../lib/validation';

describe('Pain Data Validation', () => {
  describe('PainEntry validation', () => {
    it('should validate a valid pain entry', () => {
      const validEntry = {
        timestamp: '2024-01-01T10:00:00Z',
        baselineData: {
          pain: 5,
          locations: ['lower back'],
          symptoms: ['aching']
        }
      };

      const result = validatePainEntry(validEntry);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.baselineData.pain).toBe(5);
        expect(result.data.baselineData.locations).toEqual(['lower back']);
      }
    });

    it('should reject pain entry with invalid pain level', () => {
      const invalidEntry = {
        timestamp: '2024-01-01T10:00:00Z',
        baselineData: {
          pain: 15, // Invalid: > 10
          locations: ['lower back']
        }
      };

      const result = validatePainEntry(invalidEntry);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'baselineData.pain',
            message: 'Pain level cannot exceed 10'
          })
        );
      }
    });

    it('should reject pain entry with empty locations', () => {
      const invalidEntry = {
        timestamp: '2024-01-01T10:00:00Z',
        baselineData: {
          pain: 5,
          locations: [] // Invalid: empty array
        }
      };

      const result = validatePainEntry(invalidEntry);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'baselineData.locations',
            message: 'At least one pain location is required'
          })
        );
      }
    });
  });

  describe('WCBReport validation', () => {
    it('should validate a valid WCB report', () => {
      const validReport = {
        patientInfo: {
          name: 'John Doe',
          claimNumber: 'C12345',
          injuryDate: '2023-01-01'
        },
        reportPeriod: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        },
        painEntries: [{
          timestamp: '2024-01-01T10:00:00Z',
          baselineData: {
            pain: 5,
            locations: ['lower back']
          }
        }],
        summary: {
          averagePain: 5,
          trendAnalysis: 'Stable pain levels',
          functionalChanges: 'No significant changes'
        }
      };

      const result = validateWCBReport(validReport);
      expect(result.valid).toBe(true);
    });

    it('should reject WCB report with invalid date range', () => {
      const invalidReport = {
        patientInfo: {
          name: 'John Doe',
          claimNumber: 'C12345',
          injuryDate: '2023-01-01'
        },
        reportPeriod: {
          startDate: '2024-01-31T00:00:00Z',
          endDate: '2024-01-01T00:00:00Z' // Invalid: end before start
        },
        painEntries: [{
          timestamp: '2024-01-01T10:00:00Z',
          baselineData: {
            pain: 5,
            locations: ['lower back']
          }
        }],
        summary: {
          averagePain: 5,
          trendAnalysis: 'Stable pain levels',
          functionalChanges: 'No significant changes'
        }
      };

      const result = validateWCBReport(invalidReport);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'reportPeriod',
            message: 'End date must be after start date'
          })
        );
      }
    });

    it('should reject WCB report with no pain entries', () => {
      const invalidReport = {
        patientInfo: {
          name: 'John Doe',
          claimNumber: 'C12345',
          injuryDate: '2023-01-01'
        },
        reportPeriod: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        },
        painEntries: [], // Invalid: empty array
        summary: {
          averagePain: 5,
          trendAnalysis: 'Stable pain levels',
          functionalChanges: 'No significant changes'
        }
      };

      const result = validateWCBReport(invalidReport);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'painEntries',
            message: 'At least one pain entry is required'
          })
        );
      }
    });
  });
});
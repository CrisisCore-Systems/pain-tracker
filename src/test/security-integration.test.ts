import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateWCBReport } from '../lib/validation';

// Mock the fetch function for testing
global.fetch = vi.fn();

describe('Security Features Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Validation and Submission Integration', () => {
    it('should prevent submission of invalid reports', async () => {
      // Import dynamically to avoid issues with TypeScript imports in tests
      const { submitToWCB } = await import('../services/wcb-submission');
      
      const invalidReport = {
        patientInfo: {
          name: '', // Invalid: empty name
          claimNumber: 'C12345',
          injuryDate: '2023-01-01'
        },
        reportPeriod: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        },
        painEntries: [], // Invalid: no entries
        summary: {
          averagePain: 15, // Invalid: > 10
          trendAnalysis: 'Test',
          functionalChanges: 'Test'
        }
      };

      const result = await submitToWCB(invalidReport);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Report validation failed');
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors).toContainEqual(
        expect.objectContaining({
          field: 'patientInfo.name',
          message: 'Patient name is required'
        })
      );
      
      // Should not make any network requests for invalid data
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should queue submissions when circuit breaker is open', async () => {
      const { submitToWCB, getQueuedSubmissions } = await import('../services/wcb-submission');
      
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
          trendAnalysis: 'Stable',
          functionalChanges: 'None'
        }
      };

      // Mock fetch to simulate network failures to trip circuit breaker
      (fetch as any).mockRejectedValue(new Error('Network error'));

      // First few submissions should fail and trip the circuit breaker
      for (let i = 0; i < 6; i++) {
        await submitToWCB(validReport);
      }

      // Now circuit breaker should be open, so next submission should be queued
      const queuedResult = await submitToWCB(validReport);
      
      expect(queuedResult.success).toBe(false);
      expect(queuedResult.error).toContain('Service temporarily unavailable');
      expect(queuedResult.retryAfter).toBeGreaterThan(0);
      
      // Check that submission was queued
      const queue = getQueuedSubmissions();
      expect(queue.length).toBeGreaterThan(0);
    });

    it('should provide user-friendly validation error messages', () => {
      const invalidData = {
        baselineData: {
          pain: -1, // Invalid
          locations: [] // Invalid
        }
      };

      const result = validateWCBReport(invalidData);
      expect(result.valid).toBe(false);
      
      if (!result.valid) {
        // Should have user-friendly error messages
        const painError = result.errors.find(e => e.field.includes('pain'));
        const locationError = result.errors.find(e => e.field.includes('locations'));
        
        expect(painError?.message).toContain('Pain level must be at least 0');
        expect(locationError?.message).toContain('At least one pain location is required');
      }
    });
  });

  describe('Error Boundary Recovery', () => {
    it('should handle localStorage data recovery', () => {
      // Mock some saved pain tracker data
      const mockData = [{
        id: 1,
        timestamp: '2024-01-01T10:00:00Z',
        baselineData: { pain: 5, locations: ['test'] }
      }];
      
      localStorage.setItem('pain_tracker_entries', JSON.stringify(mockData));
      
      // Simulate error boundary recovery functionality
      const savedData = localStorage.getItem('pain_tracker_entries');
      expect(savedData).toBeDefined();
      
      const parsedData = JSON.parse(savedData!);
      expect(parsedData).toEqual(mockData);
    });
  });
});
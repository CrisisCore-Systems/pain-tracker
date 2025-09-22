import { describe, it, expect } from 'vitest';
import { analyzeTrends, calculateStatistics } from './trending';
import type { PainEntry } from '../../types';

describe('Pain Tracker Trending Analysis', () => {
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
      notes: ''
    },
    {
      id: 2,
      timestamp: '2024-01-01T14:00:00Z',
      baselineData: {
        pain: 7,
        locations: ['Lower Back'],
        symptoms: ['Stiffness']
      },
      functionalImpact: {
        limitedActivities: ['Walking'],
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
        sleepQuality: 5,
        moodImpact: 6,
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
      notes: ''
    },
    {
      id: 3,
      timestamp: '2024-01-02T09:00:00Z',
      baselineData: {
        pain: 4,
        locations: ['Neck'],
        symptoms: ['Burning']
      },
      functionalImpact: {
        limitedActivities: [],
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
        sleepQuality: 7,
        moodImpact: 4,
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
      notes: ''
    }
  ];

  describe('analyzeTrends', () => {
    it('should handle empty entries', () => {
      const result = analyzeTrends([]);
      expect(result).toEqual({
        timeOfDayPattern: {},
        dayOfWeekPattern: {},
        locationFrequency: {},
        symptomCorrelations: {},
        painTrends: { increasing: false, averageChange: 0 }
      });
    });

    it('should calculate time of day patterns correctly', () => {
      const result = analyzeTrends(mockEntries);
      const key1 = new Date('2024-01-01T08:00:00Z').getHours().toString().padStart(2, '0') + ':00';
      const key2 = new Date('2024-01-01T14:00:00Z').getHours().toString().padStart(2, '0') + ':00';
      const key3 = new Date('2024-01-02T09:00:00Z').getHours().toString().padStart(2, '0') + ':00';
      expect(result.timeOfDayPattern).toHaveProperty(key1);
      expect(result.timeOfDayPattern).toHaveProperty(key2);
      expect(result.timeOfDayPattern).toHaveProperty(key3);
    });

    it('should calculate location frequency correctly', () => {
      const result = analyzeTrends(mockEntries);
      expect(result.locationFrequency).toEqual({
        'Lower Back': 2,
        'Neck': 2
      });
    });

    it('should calculate symptom correlations correctly', () => {
      const result = analyzeTrends(mockEntries);
      expect(result.symptomCorrelations).toEqual({
        'Stiffness': 12,
        'Burning': 9
      });
    });

    it('should calculate pain trends correctly', () => {
      const result = analyzeTrends(mockEntries);
      expect(result.painTrends.averageChange).toBeDefined();
      expect(typeof result.painTrends.increasing).toBe('boolean');
    });
  });

  describe('calculateStatistics', () => {
    it('should handle empty entries', () => {
      const result = calculateStatistics([]);
      expect(result).toEqual({
        mean: 0,
        median: 0,
        mode: 0,
        locationStats: {},
        symptomStats: {},
        timeRangeStats: {
          start: '',
          end: '',
          duration: 0,
          totalEntries: 0
        }
      });
    });

    it('should calculate basic statistics correctly', () => {
      const result = calculateStatistics(mockEntries);
      expect(result.mean).toBe(5.333333333333333);
      expect(result.median).toBe(5);
      expect(result.mode).toBe(5);
    });

    it('should calculate location statistics correctly', () => {
      const result = calculateStatistics(mockEntries);
      expect(result.locationStats['Lower Back']).toBeDefined();
      expect(result.locationStats['Lower Back'].frequency).toBe(2);
      expect(result.locationStats['Lower Back'].avgPain).toBe(6);
    });

    it('should calculate symptom statistics correctly', () => {
      const result = calculateStatistics(mockEntries);
      expect(result.symptomStats['Stiffness']).toBeDefined();
      expect(result.symptomStats['Stiffness'].frequency).toBe(2);
      expect(result.symptomStats['Burning'].frequency).toBe(2);
    });

    it('should calculate time range statistics correctly', () => {
      const result = calculateStatistics(mockEntries);
      expect(result.timeRangeStats.totalEntries).toBe(3);
      expect(new Date(result.timeRangeStats.start)).toBeInstanceOf(Date);
      expect(new Date(result.timeRangeStats.end)).toBeInstanceOf(Date);
      expect(result.timeRangeStats.duration).toBeGreaterThan(0);
    });
  });
}); 
import { describe, it, expect } from 'vitest';
import { analyzeTrends, calculateStatistics } from './trending';
import type { PainEntry } from '../../types';

describe('Pain Tracker Trending Analysis', () => {
  const makeEntry = (data: {
    id: number;
    timestamp: string;
    pain: number;
    locations?: string[];
    symptoms?: string[];
  }): PainEntry => ({
    id: data.id,
    timestamp: data.timestamp,
    baselineData: {
      pain: data.pain,
      locations: data.locations ?? [],
      symptoms: data.symptoms ?? [],
    },
    functionalImpact: {
      limitedActivities: [],
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
      sleepQuality: 0,
      moodImpact: 0,
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
    notes: '',
  });

  const richPainValues = [
    5, 5, 5, 5,
    5, 5, 5, 5,
    4, 4, 4, 4,
    6, 6, 6, 6,
    3, 3, 7, 8,
    9, 10, 2, 1,
    6, 4, 7, 5,
  ];

  const richLocations = ['Lower Back', 'Neck', 'Shoulder', 'Knee'];
  const richSymptoms = ['Stiffness', 'Burning', 'Spasm', 'Numbness'];

  const richEntries: PainEntry[] = Array.from({ length: 28 }, (_, index) => {
    const dayOffset = Math.floor(index / 4);
    const hour = (index % 4) * 6; // 00:00, 06:00, 12:00, 18:00
    const timestamp = new Date(Date.UTC(2024, 0, 1 + dayOffset, hour, 0, 0)).toISOString();

    const baseLocation = richLocations[index % richLocations.length];
    const extraLocation = richLocations[(index + 1) % richLocations.length];
    const locations = index % 3 === 0 ? [baseLocation, extraLocation] : [baseLocation];

    const baseSymptom = richSymptoms[index % richSymptoms.length];
    const extraSymptom = richSymptoms[(index + 2) % richSymptoms.length];
    const symptoms = index % 4 === 0 ? [baseSymptom, extraSymptom] : [baseSymptom];

    return makeEntry({
      id: 100 + index,
      timestamp,
      pain: richPainValues[index] ?? 5,
      locations,
      symptoms,
    });
  });

  describe('analyzeTrends', () => {
    it('should handle empty entries', () => {
      const result = analyzeTrends([]);
      expect(result).toEqual({
        timeOfDayPattern: {},
        dayOfWeekPattern: {},
        locationFrequency: {},
        symptomCorrelations: {},
        painTrends: { increasing: false, averageChange: 0 },
        narrativeSummary: 'Not enough data yet to summarize trends.',
        confidenceNote: 'Add a few entries across different days to build a baseline.',
      });
    });

    it('should calculate time of day patterns correctly', () => {
      const allHoursEntries: PainEntry[] = Array.from({ length: 24 }, (_, index) => {
        const hour = index.toString().padStart(2, '0');
        return makeEntry({
          id: 1000 + index,
          timestamp: `2024-01-01T${hour}:00:00Z`,
          pain: (index % 10) + 1,
        });
      });

      const result = analyzeTrends(allHoursEntries);

      const expectedTimeOfDayPattern = allHoursEntries.reduce(
        (acc, entry) => {
          const hour = new Date(entry.timestamp).getHours();
          const timeBlock = `${hour.toString().padStart(2, '0')}:00`;
          acc[timeBlock] = (acc[timeBlock] || 0) + entry.baselineData.pain;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(Object.keys(result.timeOfDayPattern)).toHaveLength(24);
      expect(result.timeOfDayPattern).toEqual(expectedTimeOfDayPattern);
    });

    it('should calculate location frequency correctly', () => {
      const result = analyzeTrends(richEntries);

      const expected = richEntries.reduce(
        (acc, entry) => {
          entry.baselineData.locations?.forEach(location => {
            acc[location] = (acc[location] || 0) + 1;
          });
          return acc;
        },
        {} as Record<string, number>
      );

      expect(result.locationFrequency).toEqual(expected);
    });

    it('should calculate symptom correlations correctly', () => {
      const result = analyzeTrends(richEntries);

      const expected = richEntries.reduce(
        (acc, entry) => {
          entry.baselineData.symptoms?.forEach(symptom => {
            acc[symptom] = (acc[symptom] || 0) + entry.baselineData.pain;
          });
          return acc;
        },
        {} as Record<string, number>
      );

      expect(result.symptomCorrelations).toEqual(expected);
    });

    it('should calculate pain trends correctly', () => {
      const result = analyzeTrends(richEntries);
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
          totalEntries: 0,
        },
      });
    });

    it('should calculate basic statistics correctly', () => {
      const result = calculateStatistics(richEntries);
      const pains = richEntries.map(e => e.baselineData.pain);
      const sorted = [...pains].sort((a, b) => a - b);

      const expectedMean = pains.reduce((sum, pain) => sum + pain, 0) / pains.length;
      const expectedMedian =
        sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];

      // Designed so 5 is the unique mode.
      const expectedMode = 5;

      expect(result.mean).toBeCloseTo(expectedMean, 12);
      expect(result.median).toBe(expectedMedian);
      expect(result.mode).toBe(expectedMode);
    });

    it('should calculate location statistics correctly', () => {
      const result = calculateStatistics(richEntries);
      const target = 'Lower Back';

      const hits = richEntries.filter(e => e.baselineData.locations?.includes(target));
      const expectedFrequency = hits.length;
      const expectedAvgPain =
        hits.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / Math.max(1, expectedFrequency);

      expect(result.locationStats[target]).toBeDefined();
      expect(result.locationStats[target].frequency).toBe(expectedFrequency);
      expect(result.locationStats[target].avgPain).toBeCloseTo(expectedAvgPain, 12);
    });

    it('should calculate symptom statistics correctly', () => {
      const result = calculateStatistics(richEntries);
      const target = 'Stiffness';

      const hits = richEntries.filter(e => e.baselineData.symptoms?.includes(target));
      expect(result.symptomStats[target]).toBeDefined();
      expect(result.symptomStats[target].frequency).toBe(hits.length);
    });

    it('should calculate time range statistics correctly', () => {
      const result = calculateStatistics(richEntries);
      expect(result.timeRangeStats.totalEntries).toBe(richEntries.length);
      expect(new Date(result.timeRangeStats.start)).toBeInstanceOf(Date);
      expect(new Date(result.timeRangeStats.end)).toBeInstanceOf(Date);
      expect(result.timeRangeStats.duration).toBeGreaterThan(0);
    });
  });
});

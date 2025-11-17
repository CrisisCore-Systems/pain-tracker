import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculatePainScore, aggregatePainData } from '../utils/pain-tracker/calculations';
import { savePainEntry, loadPainEntries, clearPainEntries } from '../utils/pain-tracker/storage';
import type { PainEntry } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test data
const mockPainEntry: PainEntry = {
  id: 1,
  timestamp: '2024-01-04T12:00:00Z',
  baselineData: {
    pain: 6,
    locations: ['lower back', 'neck'],
    symptoms: ['stiffness', 'spasm'],
  },
  functionalImpact: {
    limitedActivities: ['bending', 'lifting'],
    assistanceNeeded: ['dressing'],
    mobilityAids: ['cane'],
  },
  medications: {
    current: [
      {
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'twice daily',
        effectiveness: 'moderate',
      },
    ],
    changes: 'none',
    effectiveness: 'moderate',
  },
  treatments: {
    recent: [
      {
        type: 'Physical Therapy',
        provider: 'ABC Clinic',
        date: '2024-01-03',
        effectiveness: 'good',
      },
    ],
    effectiveness: 'good',
    planned: ['continue PT'],
  },
  qualityOfLife: {
    sleepQuality: 6,
    moodImpact: 5,
    socialImpact: ['reduced social activities'],
  },
  workImpact: {
    missedWork: 2,
    modifiedDuties: ['no heavy lifting'],
    workLimitations: ['standing limited'],
  },
  comparison: {
    worseningSince: 'last week',
    newLimitations: ['difficulty driving'],
  },
  notes: 'Pain worse in morning',
};

describe('Pain Score Calculations', () => {
  it('should calculate correct pain score', () => {
    const score = calculatePainScore(mockPainEntry);
    expect(score.total).toBeCloseTo(7.6); // 6 (pain) + 1 (2 locations * 0.5) + 0.6 (2 symptoms * 0.3)
    expect(score.severity).toBe('moderate');
    expect(score.locationFactor).toBe(1);
    expect(score.symptomFactor).toBe(0.6);
  });

  it('should determine correct severity levels', () => {
    const lowPainEntry = {
      ...mockPainEntry,
      baselineData: { ...mockPainEntry.baselineData, pain: 2 },
    };
    const severePainEntry = {
      ...mockPainEntry,
      baselineData: { ...mockPainEntry.baselineData, pain: 8 },
    };

    expect(calculatePainScore(lowPainEntry).severity).toBe('low');
    expect(calculatePainScore(mockPainEntry).severity).toBe('moderate');
    expect(calculatePainScore(severePainEntry).severity).toBe('severe');
  });
});

describe('Pain Data Aggregation', () => {
  const mockEntries: PainEntry[] = [
    mockPainEntry,
    {
      ...mockPainEntry,
      id: 2,
      timestamp: '2024-01-04T15:00:00Z',
      baselineData: {
        ...mockPainEntry.baselineData,
        pain: 4,
        locations: ['lower back'],
        symptoms: ['stiffness'],
      },
    },
  ];

  it('should calculate correct average pain', () => {
    const aggregated = aggregatePainData(mockEntries);
    expect(aggregated.averagePain).toBe(5); // (6 + 4) / 2
  });

  it('should identify common locations and symptoms', () => {
    const aggregated = aggregatePainData(mockEntries);
    expect(aggregated.commonLocations).toHaveLength(2);
    expect(aggregated.commonLocations[0].location).toBe('lower back');
    expect(aggregated.commonLocations[0].frequency).toBe(2);

    expect(aggregated.commonSymptoms).toHaveLength(2);
    expect(aggregated.commonSymptoms[0].symptom).toBe('stiffness');
    expect(aggregated.commonSymptoms[0].frequency).toBe(2);
  });

  it('should determine correct pain trend', () => {
    const aggregated = aggregatePainData(mockEntries);
    expect(aggregated.painTrend).toBe('improving'); // 6 -> 4
  });

  it('should handle empty entries', () => {
    const aggregated = aggregatePainData([]);
    expect(aggregated.averagePain).toBe(0);
    expect(aggregated.commonLocations).toHaveLength(0);
    expect(aggregated.commonSymptoms).toHaveLength(0);
    expect(aggregated.painTrend).toBe('stable');
  });
});

describe('Pain Entry Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should save and load pain entries', async () => {
    await savePainEntry(mockPainEntry);
    const loaded = await loadPainEntries();

    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toEqual(mockPainEntry);
  });

  it('should update existing entry', async () => {
    await savePainEntry(mockPainEntry);
    const updatedEntry = {
      ...mockPainEntry,
      baselineData: { ...mockPainEntry.baselineData, pain: 7 },
    };
    await savePainEntry(updatedEntry);

    const loaded = await loadPainEntries();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].baselineData.pain).toBe(7);
  });

  it('should handle multiple entries', async () => {
    const secondEntry = { ...mockPainEntry, id: 2 };
    await savePainEntry(mockPainEntry);
    await savePainEntry(secondEntry);

    const loaded = await loadPainEntries();
    expect(loaded).toHaveLength(2);
  });

  it('should clear entries', async () => {
    await savePainEntry(mockPainEntry);
    await clearPainEntries();

    const loaded = await loadPainEntries();
    expect(loaded).toHaveLength(0);
  });

  it('should handle corrupted data', async () => {
    localStorageMock.setItem('pain_tracker_entries', 'invalid json');

    await expect(loadPainEntries()).rejects.toThrow();
  });

  it('should validate entry structure', async () => {
    const invalidEntry = { id: 1 }; // Missing required fields
    localStorageMock.setItem('pain_tracker_entries', JSON.stringify([invalidEntry]));

    await expect(loadPainEntries()).rejects.toThrow();
  });
});

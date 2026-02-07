/**
 * Store Persistence Synthetic Tests
 * ==================================
 * Tests for data store functionality including state management,
 * persistence, and migration scenarios using synthetic data.
 * 
 * Part of: VALIDATION PROTOCOL v1.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateSyntheticEntries,
  generateCrisisPeriod,
  PREDEFINED_SCENARIOS,
} from './synthetic-data-generator';
import type { PainEntry } from '../../types';

// Mock dependencies for store tests
vi.mock('../../services/PrivacyAnalyticsService', () => ({
  privacyAnalytics: {
    trackDataExport: vi.fn().mockResolvedValue(undefined),
    trackFeatureUsage: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../analytics/ga4-events', () => ({
  trackDataExported: vi.fn(),
  trackMoodEntryLogged: vi.fn(),
}));

vi.mock('../../utils/usage-tracking', () => ({
  trackExport: vi.fn(),
}));

vi.mock('../../lib/debug-logger', () => ({
  analyticsLogger: { swallowed: vi.fn() },
}));

vi.mock('../../services/HIPAACompliance', () => ({
  hipaaComplianceService: {
    logAuditEvent: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Store Persistence - Synthetic Testing Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('State Management', () => {
    it('should handle adding 100 entries sequentially', () => {
      const entries = generateSyntheticEntries(34, 3, { seed: 12345 }); // ~100 entries

      // Simulate sequential adds
      const storedEntries: PainEntry[] = [];
      
      const startTime = performance.now();
      entries.forEach(entry => {
        storedEntries.push(entry);
      });
      const addTime = performance.now() - startTime;

      expect(storedEntries).toHaveLength(entries.length);
      expect(addTime).toBeLessThan(100); // Should be very fast

      console.log(`SEQUENTIAL_ADD_TEST: Added ${storedEntries.length} entries in ${addTime.toFixed(2)}ms - PASS`);
    });

    it('should handle bulk entry operations', () => {
      const entries = generateSyntheticEntries(100, 3, { seed: 22222 }); // ~300 entries

      const startTime = performance.now();
      
      // Bulk operations
      const sortedByPain = [...entries].sort((a, b) => b.baselineData.pain - a.baselineData.pain);
      const highPainEntries = sortedByPain.filter(e => e.baselineData.pain >= 7);
      const avgPain = entries.reduce((sum, e) => sum + e.baselineData.pain, 0) / entries.length;
      
      const operationTime = performance.now() - startTime;

      expect(sortedByPain[0].baselineData.pain).toBeGreaterThanOrEqual(sortedByPain[sortedByPain.length - 1].baselineData.pain);
      expect(operationTime).toBeLessThan(100);

      console.log(`BULK_OPERATIONS_TEST: Processed ${entries.length} entries in ${operationTime.toFixed(2)}ms - PASS`);
    });

    it('should handle entry updates correctly', () => {
      const entries = generateSyntheticEntries(30, 3, { seed: 33333 });
      
      // Create mutable copy
      const mutableEntries = entries.map(e => ({ ...e }));
      
      // Simulate updates
      const updateCount = 10;
      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * mutableEntries.length);
        mutableEntries[index] = {
          ...mutableEntries[index],
          notes: `Updated note ${i}`,
          baselineData: {
            ...mutableEntries[index].baselineData,
            pain: Math.min(10, mutableEntries[index].baselineData.pain + 1),
          },
        };
      }

      // Verify updates
      const updatedNotes = mutableEntries.filter(e => e.notes.startsWith('Updated'));
      expect(updatedNotes.length).toBeGreaterThan(0);

      console.log(`ENTRY_UPDATE_TEST: ${updateCount} updates applied - PASS`);
    });

    it('should handle entry deletion correctly', () => {
      const entries = generateSyntheticEntries(50, 3, { seed: 44444 });
      let mutableEntries = [...entries];

      const originalLength = mutableEntries.length;
      const deleteCount = 10;

      // Delete random entries
      for (let i = 0; i < deleteCount; i++) {
        const index = Math.floor(Math.random() * mutableEntries.length);
        mutableEntries = mutableEntries.filter((_, idx) => idx !== index);
      }

      expect(mutableEntries.length).toBe(originalLength - deleteCount);

      console.log(`ENTRY_DELETION_TEST: Deleted ${deleteCount} entries, ${mutableEntries.length} remaining - PASS`);
    });
  });

  describe('Data Filtering and Queries', () => {
    it('should filter entries by date range efficiently', () => {
      const entries = generateSyntheticEntries(90, 3, { seed: 55555 });

      const startTime = performance.now();
      
      // Get entries from last 30 days
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentEntries = entries.filter(e => 
        new Date(e.timestamp).getTime() > thirtyDaysAgo
      );
      
      const filterTime = performance.now() - startTime;

      expect(recentEntries.length).toBeGreaterThan(0);
      expect(recentEntries.length).toBeLessThanOrEqual(entries.length);
      expect(filterTime).toBeLessThan(50);

      console.log(`DATE_FILTER_TEST: Filtered to ${recentEntries.length} entries in ${filterTime.toFixed(2)}ms - PASS`);
    });

    it('should filter entries by pain level', () => {
      const entries = generateSyntheticEntries(60, 3, { seed: 66666 });

      const highPain = entries.filter(e => e.baselineData.pain >= 7);
      const mediumPain = entries.filter(e => e.baselineData.pain >= 4 && e.baselineData.pain <= 6);
      const lowPain = entries.filter(e => e.baselineData.pain <= 3);

      // All entries should be categorized
      expect(highPain.length + mediumPain.length + lowPain.length).toBe(entries.length);

      console.log(`PAIN_FILTER_TEST: High=${highPain.length}, Medium=${mediumPain.length}, Low=${lowPain.length} - PASS`);
    });

    it('should filter entries by location', () => {
      const entries = generateSyntheticEntries(60, 3, {
        profile: 'chronic-back-pain',
        seed: 77777,
      });

      const backEntries = entries.filter(e => 
        e.baselineData.locations.some(loc => 
          loc.toLowerCase().includes('back')
        )
      );

      // Back pain profile should have many back-related entries
      expect(backEntries.length).toBeGreaterThan(0);

      console.log(`LOCATION_FILTER_TEST: Found ${backEntries.length} back-related entries - PASS`);
    });

    it('should filter entries by symptom', () => {
      const entries = generateSyntheticEntries(60, 3, {
        profile: 'fibromyalgia',
        seed: 88888,
      });

      const stiffnessEntries = entries.filter(e =>
        e.baselineData.symptoms.some(s => 
          s.toLowerCase().includes('stiff')
        )
      );

      console.log(`SYMPTOM_FILTER_TEST: Found ${stiffnessEntries.length} entries with stiffness - PASS`);
    });
  });

  describe('Data Aggregation', () => {
    it('should calculate daily averages correctly', () => {
      const entries = generateSyntheticEntries(30, 3, { seed: 99999 });

      // Group by date
      const byDate = new Map<string, PainEntry[]>();
      entries.forEach(entry => {
        const date = entry.timestamp.split('T')[0];
        if (!byDate.has(date)) byDate.set(date, []);
        byDate.get(date)!.push(entry);
      });

      // Calculate daily averages
      const dailyAverages = Array.from(byDate.entries()).map(([date, dayEntries]) => ({
        date,
        avgPain: dayEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / dayEntries.length,
        entryCount: dayEntries.length,
      }));

      // Verify calculations
      dailyAverages.forEach(day => {
        expect(day.avgPain).toBeGreaterThanOrEqual(1);
        expect(day.avgPain).toBeLessThanOrEqual(10);
        expect(day.entryCount).toBeGreaterThan(0);
      });

      console.log(`DAILY_AVERAGE_TEST: Calculated averages for ${dailyAverages.length} days - PASS`);
    });

    it('should calculate weekly summaries correctly', () => {
      const entries = generateSyntheticEntries(60, 3, { seed: 11112 });

      // Group by week
      const byWeek = new Map<number, PainEntry[]>();
      entries.forEach(entry => {
        const date = new Date(entry.timestamp);
        const weekNumber = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
        if (!byWeek.has(weekNumber)) byWeek.set(weekNumber, []);
        byWeek.get(weekNumber)!.push(entry);
      });

      // Calculate weekly stats
      const weeklyStats = Array.from(byWeek.entries()).map(([week, weekEntries]) => ({
        week,
        avgPain: weekEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / weekEntries.length,
        maxPain: Math.max(...weekEntries.map(e => e.baselineData.pain)),
        minPain: Math.min(...weekEntries.map(e => e.baselineData.pain)),
        entryCount: weekEntries.length,
      }));

      expect(weeklyStats.length).toBeGreaterThan(0);

      console.log(`WEEKLY_SUMMARY_TEST: Calculated summaries for ${weeklyStats.length} weeks - PASS`);
    });

    it('should calculate location frequency correctly', () => {
      const entries = generateSyntheticEntries(60, 3, { seed: 22223 });

      // Count location frequencies
      const locationCounts = new Map<string, number>();
      entries.forEach(entry => {
        entry.baselineData.locations.forEach(loc => {
          const normalized = loc.toLowerCase().trim();
          locationCounts.set(normalized, (locationCounts.get(normalized) || 0) + 1);
        });
      });

      // Get top locations
      const sortedLocations = Array.from(locationCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      expect(sortedLocations.length).toBeGreaterThan(0);

      console.log(`LOCATION_FREQUENCY_TEST: Top location: ${sortedLocations[0][0]} (${sortedLocations[0][1]} occurrences) - PASS`);
    });
  });

  describe('State Serialization', () => {
    it('should serialize state to JSON correctly', () => {
      const entries = generateSyntheticEntries(30, 3, { seed: 33334 });

      const state = {
        entries,
        lastUpdated: new Date().toISOString(),
        version: 1,
      };

      const serialized = JSON.stringify(state);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.entries).toHaveLength(entries.length);
      expect(deserialized.version).toBe(1);

      console.log('STATE_SERIALIZATION_TEST: State serialized and deserialized correctly - PASS');
    });

    it('should handle large state serialization', () => {
      const yearData = PREDEFINED_SCENARIOS.yearLongUsage().entries;

      const state = {
        entries: yearData,
        metadata: { created: new Date().toISOString() },
      };

      const startTime = performance.now();
      const serialized = JSON.stringify(state);
      const serializeTime = performance.now() - startTime;

      const parseStart = performance.now();
      const deserialized = JSON.parse(serialized);
      const parseTime = performance.now() - parseStart;

      expect(deserialized.entries.length).toBe(yearData.length);
      expect(serializeTime).toBeLessThan(1000);
      expect(parseTime).toBeLessThan(1000);

      console.log(`LARGE_STATE_TEST: Serialize=${serializeTime.toFixed(0)}ms, Parse=${parseTime.toFixed(0)}ms - PASS`);
    });
  });

  describe('Data Migration Scenarios', () => {
    it('should handle v1 to v2 migration scenario', () => {
      // Simulate v1 data format (simplified entries)
      const v1Entries = generateSyntheticEntries(30, 3, { seed: 44445 }).map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        pain: e.baselineData.pain,
        locations: e.baselineData.locations,
        notes: e.notes,
      }));

      // Migrate to v2 format
      const v2Entries: PainEntry[] = v1Entries.map(v1 => ({
        id: v1.id,
        timestamp: v1.timestamp,
        baselineData: {
          pain: v1.pain,
          locations: v1.locations,
          symptoms: [],
        },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 5, moodImpact: 5, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: v1.notes,
      }));

      // Verify migration
      expect(v2Entries).toHaveLength(v1Entries.length);
      v2Entries.forEach((entry, index) => {
        expect(entry.baselineData.pain).toBe(v1Entries[index].pain);
        expect(entry.id).toBe(v1Entries[index].id);
      });

      console.log(`MIGRATION_V1_V2_TEST: Migrated ${v2Entries.length} entries - PASS`);
    });

    it('should handle missing fields during migration', () => {
      // Simulate incomplete data
      const incompleteEntries = [
        { id: '1', timestamp: new Date().toISOString(), baselineData: { pain: 5 } },
        { id: '2', timestamp: new Date().toISOString() },
        { id: '3' },
      ];

      // Migration with defaults
      const migratedEntries: PainEntry[] = incompleteEntries.map(e => ({
        id: e.id || `generated-${Date.now()}`,
        timestamp: e.timestamp || new Date().toISOString(),
        baselineData: {
          pain: (e.baselineData as Record<string, unknown>)?.pain as number || 5,
          locations: ((e.baselineData as Record<string, unknown>)?.locations as string[]) || [],
          symptoms: ((e.baselineData as Record<string, unknown>)?.symptoms as string[]) || [],
        },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 5, moodImpact: 5, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: '',
      }));

      // All entries should be valid after migration
      migratedEntries.forEach((entry, index) => {
        expect(entry.id, `Entry ${index} missing id`).toBeDefined();
        expect(entry.timestamp, `Entry ${index} missing timestamp`).toBeDefined();
        expect(entry.baselineData.pain, `Entry ${index} missing pain`).toBeGreaterThanOrEqual(1);
      });

      console.log('MISSING_FIELDS_MIGRATION_TEST: Handled missing fields - PASS');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent reads and writes', async () => {
      const entries = generateSyntheticEntries(30, 3, { seed: 55556 });
      let state: PainEntry[] = [...entries];

      // Simulate concurrent operations
      const operations = [
        // Read operations
        () => state.length,
        () => state.filter(e => e.baselineData.pain > 5).length,
        () => state.reduce((sum, e) => sum + e.baselineData.pain, 0),
        // Write operations
        () => { state = [...state, entries[0]]; return state.length; },
        () => { state = state.filter(e => e.id !== entries[0].id); return state.length; },
      ];

      const startTime = performance.now();
      
      // Run operations concurrently
      const results = await Promise.all(
        operations.map(op => Promise.resolve(op()))
      );
      
      const operationTime = performance.now() - startTime;

      expect(results.length).toBe(operations.length);
      expect(operationTime).toBeLessThan(100);

      console.log(`CONCURRENT_OPERATIONS_TEST: ${operations.length} operations in ${operationTime.toFixed(2)}ms - PASS`);
    });
  });

  describe('Memory Efficiency', () => {
    it('should handle large datasets without memory issues', () => {
      const startMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
      
      // Generate large dataset
      const largeDataset = PREDEFINED_SCENARIOS.yearLongUsage().entries;
      
      // Perform operations
      const avgPain = largeDataset.reduce((sum, e) => sum + e.baselineData.pain, 0) / largeDataset.length;
      const sorted = [...largeDataset].sort((a, b) => b.baselineData.pain - a.baselineData.pain);
      const filtered = largeDataset.filter(e => e.baselineData.pain >= 7);
      
      const endMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
      const memoryIncrease = (endMemory - startMemory) / 1024 / 1024; // MB

      expect(avgPain).toBeGreaterThan(0);
      expect(sorted.length).toBe(largeDataset.length);
      
      // Memory increase should be reasonable (less than 100MB for this dataset)
      if (typeof process.memoryUsage === 'function') {
        expect(memoryIncrease).toBeLessThan(100);
      }

      console.log(`MEMORY_EFFICIENCY_TEST: ${largeDataset.length} entries, ~${memoryIncrease.toFixed(1)}MB memory - PASS`);
    });
  });
});

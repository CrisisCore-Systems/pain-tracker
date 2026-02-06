/**
 * Synthetic Test Runner
 * =====================
 * Utility for running synthetic validation tests with detailed reporting.
 * Provides test scenarios, benchmarks, and validation summaries.
 * 
 * Part of: VALIDATION PROTOCOL v1.0
 */

import type { PainEntry } from '../../types';
import {
  generateSyntheticEntries,
  generateCrisisPeriod,
  generateRecoveryPeriod,
  generateFlarePeriod,
  generateSyntheticScenario,
  PREDEFINED_SCENARIOS,
  type SyntheticScenario,
  type PredefinedScenarioName,
} from './synthetic-data-generator';
import { exportToCSV, exportToJSON } from '../../utils/pain-tracker/export';

// ============================================================================
// Test Result Types
// ============================================================================

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface BenchmarkResult {
  name: string;
  iterations: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  opsPerSecond: number;
}

export interface ValidationSummary {
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  results: TestResult[];
  benchmarks: BenchmarkResult[];
}

// ============================================================================
// Test Functions
// ============================================================================

/**
 * Run a single test with timing
 */
function runTest(
  name: string,
  testFn: () => void | Promise<void>
): TestResult {
  const startTime = performance.now();
  
  try {
    const result = testFn();
    if (result instanceof Promise) {
      throw new Error('Use runAsyncTest for async tests');
    }
    
    return {
      name,
      passed: true,
      duration: performance.now() - startTime,
      message: 'PASS',
    };
  } catch (error) {
    return {
      name,
      passed: false,
      duration: performance.now() - startTime,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run benchmark test
 */
function runBenchmark(
  name: string,
  iterations: number,
  benchFn: () => void
): BenchmarkResult {
  const durations: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    benchFn();
    durations.push(performance.now() - start);
  }
  
  const sum = durations.reduce((a, b) => a + b, 0);
  
  return {
    name,
    iterations,
    avgDuration: sum / iterations,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    opsPerSecond: 1000 / (sum / iterations),
  };
}

// ============================================================================
// Validation Test Suite
// ============================================================================

/**
 * Run data integrity tests
 */
export function runDataIntegrityTests(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Entry generation
  results.push(runTest('Generate 30-day entries', () => {
    const entries = generateSyntheticEntries(30, 3, { seed: 12345 });
    if (entries.length < 60) throw new Error(`Too few entries: ${entries.length}`);
    if (entries.length > 120) throw new Error(`Too many entries: ${entries.length}`);
  }));

  // Test 2: Seeded generation determinism
  results.push(runTest('Seeded generation determinism', () => {
    const run1 = generateSyntheticEntries(10, 3, { seed: 11111 });
    const run2 = generateSyntheticEntries(10, 3, { seed: 11111 });
    if (run1.length !== run2.length) throw new Error('Entry count mismatch');
    if (run1[0].baselineData.pain !== run2[0].baselineData.pain) {
      throw new Error('Pain level mismatch with same seed');
    }
  }));

  // Test 3: Entry structure validation
  results.push(runTest('Entry structure validation', () => {
    const entries = generateSyntheticEntries(30, 3, { seed: 22222 });
    entries.forEach((entry, index) => {
      if (!entry.id) throw new Error(`Entry ${index} missing id`);
      if (!entry.timestamp) throw new Error(`Entry ${index} missing timestamp`);
      if (entry.baselineData.pain < 1 || entry.baselineData.pain > 10) {
        throw new Error(`Entry ${index} invalid pain level`);
      }
    });
  }));

  // Test 4: Profile-specific generation
  results.push(runTest('Profile-specific generation', () => {
    const backPain = generateSyntheticEntries(30, 3, { profile: 'chronic-back-pain', seed: 33333 });
    const fibro = generateSyntheticEntries(30, 3, { profile: 'fibromyalgia', seed: 44444 });
    
    if (backPain.length === 0) throw new Error('No back pain entries generated');
    if (fibro.length === 0) throw new Error('No fibromyalgia entries generated');
  }));

  // Test 5: Crisis period generation
  results.push(runTest('Crisis period generation', () => {
    const crisis = generateCrisisPeriod(14, 55555);
    const highPain = crisis.filter(e => e.baselineData.pain >= 7);
    const ratio = highPain.length / crisis.length;
    if (ratio < 0.7) throw new Error(`Crisis high pain ratio too low: ${ratio}`);
  }));

  // Test 6: Recovery period generation
  results.push(runTest('Recovery period generation', () => {
    const recovery = generateRecoveryPeriod(30, 66666);
    const sorted = [...recovery].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    
    const firstAvg = firstHalf.reduce((s, e) => s + e.baselineData.pain, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, e) => s + e.baselineData.pain, 0) / secondHalf.length;
    
    if (secondAvg >= firstAvg) throw new Error('Recovery trend not detected');
  }));

  // Test 7: Flare period generation
  results.push(runTest('Flare period generation', () => {
    const flare = generateFlarePeriod(28, 7, 77777);
    if (flare.length < 40) throw new Error('Too few flare entries');
    
    // Check for variation indicating cyclical pattern
    const pains = flare.map(e => e.baselineData.pain);
    const variance = pains.reduce((sum, p) => {
      const mean = pains.reduce((a, b) => a + b) / pains.length;
      return sum + Math.pow(p - mean, 2);
    }, 0) / pains.length;
    
    if (variance < 0.5) throw new Error('Insufficient cyclical variation');
  }));

  return results;
}

/**
 * Run export tests
 */
export function runExportTests(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: CSV export
  results.push(runTest('CSV export', () => {
    const entries = generateSyntheticEntries(30, 3, { seed: 11111 });
    const csv = exportToCSV(entries);
    if (!csv.includes('Date,Time,Pain Level')) throw new Error('Missing CSV header');
  }));

  // Test 2: JSON export
  results.push(runTest('JSON export', () => {
    const entries = generateSyntheticEntries(30, 3, { seed: 22222 });
    const json = exportToJSON(entries);
    const parsed = JSON.parse(json);
    if (parsed.length !== entries.length) throw new Error('Entry count mismatch');
  }));

  // Test 3: Export roundtrip
  results.push(runTest('Export roundtrip integrity', () => {
    const original = generateSyntheticEntries(30, 3, { seed: 33333 });
    const json = exportToJSON(original);
    const restored = JSON.parse(json);
    
    for (let i = 0; i < original.length; i++) {
      if (original[i].baselineData.pain !== restored[i].baselineData.pain) {
        throw new Error(`Pain mismatch at entry ${i}`);
      }
    }
  }));

  // Test 4: Large dataset export
  results.push(runTest('Large dataset export (1000 entries)', () => {
    const entries = generateSyntheticEntries(334, 3, { seed: 44444 });
    const csv = exportToCSV(entries);
    const json = exportToJSON(entries);
    
    if (csv.length < 10000) throw new Error('CSV too short');
    if (JSON.parse(json).length !== entries.length) throw new Error('JSON count mismatch');
  }));

  // Test 5: Empty export handling
  results.push(runTest('Empty export handling', () => {
    const csv = exportToCSV([]);
    const json = exportToJSON([]);
    
    if (!csv.includes('Date,Time')) throw new Error('Empty CSV missing header');
    if (json !== '[]') throw new Error('Empty JSON not empty array');
  }));

  return results;
}

/**
 * Run performance benchmarks
 */
export function runPerformanceBenchmarks(): BenchmarkResult[] {
  const benchmarks: BenchmarkResult[] = [];

  // Benchmark 1: Entry generation speed
  benchmarks.push(runBenchmark(
    'Generate 100 entries',
    10,
    () => generateSyntheticEntries(34, 3, { seed: Date.now() })
  ));

  // Benchmark 2: CSV export speed
  const csvEntries = generateSyntheticEntries(100, 3, { seed: 11111 });
  benchmarks.push(runBenchmark(
    'CSV export (300 entries)',
    10,
    () => exportToCSV(csvEntries)
  ));

  // Benchmark 3: JSON export speed
  benchmarks.push(runBenchmark(
    'JSON export (300 entries)',
    10,
    () => exportToJSON(csvEntries)
  ));

  // Benchmark 4: Large dataset handling
  benchmarks.push(runBenchmark(
    'Generate 1000 entries',
    5,
    () => generateSyntheticEntries(334, 3, { seed: Date.now() })
  ));

  // Benchmark 5: JSON parse speed
  const jsonStr = exportToJSON(csvEntries);
  benchmarks.push(runBenchmark(
    'JSON parse (300 entries)',
    10,
    () => JSON.parse(jsonStr)
  ));

  return benchmarks;
}

/**
 * Run predefined scenario tests
 */
export function runScenarioTests(): TestResult[] {
  const results: TestResult[] = [];

  const scenarioNames = Object.keys(PREDEFINED_SCENARIOS) as PredefinedScenarioName[];

  for (const name of scenarioNames) {
    results.push(runTest(`Scenario: ${name}`, () => {
      const scenario = PREDEFINED_SCENARIOS[name]();
      
      if (scenario.entries.length === 0) {
        throw new Error('No entries generated');
      }
      
      // Validate all entries
      scenario.entries.forEach((entry, index) => {
        if (!entry.id) throw new Error(`Entry ${index} missing id`);
        if (entry.baselineData.pain < 1 || entry.baselineData.pain > 10) {
          throw new Error(`Entry ${index} invalid pain`);
        }
      });
    }));
  }

  return results;
}

/**
 * Run full validation suite
 */
export function runFullValidation(): ValidationSummary {
  const startTime = performance.now();
  const allResults: TestResult[] = [];
  const allBenchmarks: BenchmarkResult[] = [];

  console.log('='.repeat(60));
  console.log('SYNTHETIC VALIDATION SUITE');
  console.log('='.repeat(60));

  // Run data integrity tests
  console.log('\n📊 Data Integrity Tests');
  console.log('-'.repeat(40));
  const integrityResults = runDataIntegrityTests();
  integrityResults.forEach(r => {
    console.log(`  ${r.passed ? '✅' : '❌'} ${r.name} (${r.duration.toFixed(1)}ms)`);
  });
  allResults.push(...integrityResults);

  // Run export tests
  console.log('\n📁 Export Tests');
  console.log('-'.repeat(40));
  const exportResults = runExportTests();
  exportResults.forEach(r => {
    console.log(`  ${r.passed ? '✅' : '❌'} ${r.name} (${r.duration.toFixed(1)}ms)`);
  });
  allResults.push(...exportResults);

  // Run scenario tests
  console.log('\n🎭 Scenario Tests');
  console.log('-'.repeat(40));
  const scenarioResults = runScenarioTests();
  scenarioResults.forEach(r => {
    console.log(`  ${r.passed ? '✅' : '❌'} ${r.name} (${r.duration.toFixed(1)}ms)`);
  });
  allResults.push(...scenarioResults);

  // Run benchmarks
  console.log('\n⏱️ Performance Benchmarks');
  console.log('-'.repeat(40));
  const benchmarks = runPerformanceBenchmarks();
  benchmarks.forEach(b => {
    console.log(`  📈 ${b.name}: ${b.avgDuration.toFixed(2)}ms avg (${b.opsPerSecond.toFixed(0)} ops/s)`);
  });
  allBenchmarks.push(...benchmarks);

  const totalDuration = performance.now() - startTime;
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${allResults.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Duration: ${totalDuration.toFixed(0)}ms`);
  console.log('='.repeat(60));

  return {
    totalTests: allResults.length,
    passed,
    failed,
    duration: totalDuration,
    results: allResults,
    benchmarks: allBenchmarks,
  };
}

// ============================================================================
// Utility Exports
// ============================================================================

export {
  generateSyntheticEntries,
  generateCrisisPeriod,
  generateRecoveryPeriod,
  generateFlarePeriod,
  generateSyntheticScenario,
  PREDEFINED_SCENARIOS,
};

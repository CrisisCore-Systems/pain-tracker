/**
 * Seeded random number generator for deterministic tests
 * Uses a simple Linear Congruential Generator (LCG) algorithm
 */

export class SeededRandom {
  private seed: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = 2 ** 32;

  constructor(seed: number = 42) {
    this.seed = seed;
  }

  /**
   * Returns a pseudo-random number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }

  /**
   * Returns a pseudo-random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Returns a random element from an array
   */
  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }

  /**
   * Resets the generator to its initial seed
   */
  reset(newSeed?: number): void {
    this.seed = newSeed ?? 42;
  }
}

// Global instance for test fixtures
let testRandom = new SeededRandom();

/**
 * Get the global seeded random instance
 */
export function getTestRandom(): SeededRandom {
  return testRandom;
}

/**
 * Reset the global seeded random instance
 * Call this in beforeEach() to ensure deterministic tests
 */
export function resetTestRandom(seed: number = 42): void {
  testRandom.reset(seed);
}

/**
 * Drop-in replacement for Math.random() that uses seeded generation
 */
export function seededRandom(): number {
  return testRandom.next();
}

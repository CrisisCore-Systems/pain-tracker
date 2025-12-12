import { describe, it, expect, beforeEach } from 'vitest';
import { SeededRandom, resetTestRandom, seededRandom, getTestRandom } from './seededRandom';

describe('SeededRandom', () => {
  it('produces deterministic sequences with the same seed', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);

    const sequence1 = [rng1.next(), rng1.next(), rng1.next()];
    const sequence2 = [rng2.next(), rng2.next(), rng2.next()];

    expect(sequence1).toEqual(sequence2);
  });

  it('produces different sequences with different seeds', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(123);

    const sequence1 = [rng1.next(), rng1.next(), rng1.next()];
    const sequence2 = [rng2.next(), rng2.next(), rng2.next()];

    expect(sequence1).not.toEqual(sequence2);
  });

  it('can be reset to reproduce sequences', () => {
    const rng = new SeededRandom(42);
    const firstSequence = [rng.next(), rng.next(), rng.next()];
    
    rng.reset(42);
    const secondSequence = [rng.next(), rng.next(), rng.next()];

    expect(firstSequence).toEqual(secondSequence);
  });

  it('generates numbers between 0 and 1', () => {
    const rng = new SeededRandom();
    for (let i = 0; i < 100; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('nextInt generates integers in the specified range', () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(5, 10);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThan(10);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('choice selects from array deterministically', () => {
    const array = ['a', 'b', 'c', 'd', 'e'];
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);

    const choices1 = [rng1.choice(array), rng1.choice(array), rng1.choice(array)];
    const choices2 = [rng2.choice(array), rng2.choice(array), rng2.choice(array)];

    expect(choices1).toEqual(choices2);
  });
});

describe('Global test random helpers', () => {
  beforeEach(() => {
    resetTestRandom();
  });

  it('getTestRandom returns the global instance', () => {
    const rng = getTestRandom();
    expect(rng).toBeInstanceOf(SeededRandom);
  });

  it('seededRandom produces deterministic values after reset', () => {
    const sequence1 = [seededRandom(), seededRandom(), seededRandom()];
    
    resetTestRandom();
    const sequence2 = [seededRandom(), seededRandom(), seededRandom()];

    expect(sequence1).toEqual(sequence2);
  });

  it('resetTestRandom with different seed produces different sequences', () => {
    resetTestRandom(42);
    const sequence1 = [seededRandom(), seededRandom(), seededRandom()];
    
    resetTestRandom(123);
    const sequence2 = [seededRandom(), seededRandom(), seededRandom()];

    expect(sequence1).not.toEqual(sequence2);
  });
});

import { describe, it, expect } from 'vitest';
import { parseFreeformList } from '../parseFreeformList';

describe('parseFreeformList', () => {
  it('splits on commas and newlines, trimming whitespace', () => {
    expect(parseFreeformList('  walking,  yoga\nPT  ')).toEqual(['walking', 'yoga', 'PT']);
  });

  it('dedupes case-insensitively while preserving first spelling', () => {
    expect(parseFreeformList('Gluten, gluten, GLUTEN, Dairy')).toEqual(['Gluten', 'Dairy']);
  });

  it('returns empty for empty/whitespace', () => {
    expect(parseFreeformList('  \n ,  ')).toEqual([]);
  });
});

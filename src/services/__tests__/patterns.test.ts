import { detectSuddenSpike } from '../../services/patterns';

describe('detectSuddenSpike', () => {
  test('returns -1 for no spike', () => {
    expect(detectSuddenSpike([1,2,2,3,3], 3)).toBe(-1);
  });

  test('detects a spike index', () => {
    expect(detectSuddenSpike([2,2,6,6], 3)).toBe(2);
  });

  test('handles empty series', () => {
    expect(detectSuddenSpike([], 3)).toBe(-1);
  });
});

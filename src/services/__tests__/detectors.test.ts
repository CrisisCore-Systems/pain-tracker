import { rollingAverageSpike, simpleZScoreOutlier } from '../detectors';

describe('detectors', () => {
  test('rollingAverageSpike detects spike', () => {
    const series = [2,2,2,6];
    expect(rollingAverageSpike(series, 3, 1)).toBe(3);
  });

  test('rollingAverageSpike returns -1 when no spike', () => {
    expect(rollingAverageSpike([1,2,3,2,3], 3, 1.5)).toBe(-1);
  });

  test('simpleZScoreOutlier detects outlier', () => {
    const series = [1,1,1,10,1];
    expect(simpleZScoreOutlier(series, 2)).toBe(3);
  });

  test('simpleZScoreOutlier returns -1 for none', () => {
    expect(simpleZScoreOutlier([1,1,1,1], 2)).toBe(-1);
  });
});

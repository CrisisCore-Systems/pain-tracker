// Simple detectors: rolling average spike detector and z-score outlier detector
export function rollingAverageSpike(series: number[], window = 3, multiplier = 1.5) {
  if (series.length < window + 1) return -1;
  for (let i = window; i < series.length; i++) {
    const windowSlice = series.slice(i - window, i);
    const avg = windowSlice.reduce((s, v) => s + v, 0) / window;
    if (series[i] - avg >= multiplier * Math.max(1, avg * 0.1)) return i;
  }
  return -1;
}

export function simpleZScoreOutlier(series: number[], threshold = 2) {
  if (series.length === 0) return -1;
  const mean = series.reduce((s, v) => s + v, 0) / series.length;
  const variance = series.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / series.length;
  const sd = Math.sqrt(variance);
  for (let i = 0; i < series.length; i++) {
    if (sd === 0) continue;
    const z = Math.abs((series[i] - mean) / sd);
    if (z >= threshold) return i;
  }
  return -1;
}

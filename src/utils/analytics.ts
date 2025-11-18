// Lightweight analytics helpers used by dashboards
export function rollingAverage(values: number[], windowSize: number) {
  if (windowSize <= 0) return [];
  const res: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1).filter(v => typeof v === 'number' && !isNaN(v));
    const avg = window.length ? window.reduce((a, b) => a + b, 0) / window.length : 0;
    res.push(avg);
  }
  return res;
}

export function movingStdDev(values: number[], windowSize: number) {
  if (windowSize <= 0) return [];
  const res: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1).filter(v => typeof v === 'number' && !isNaN(v));
    if (window.length === 0) {
      res.push(0);
      continue;
    }
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / window.length;
    res.push(Math.sqrt(variance));
  }
  return res;
}

// Simple z-score anomaly detector. Returns indices (positions) that are anomalies.
export function detectAnomalies(values: number[], windowSize = 7, zThreshold = 2.5) {
  const anomalies: number[] = [];
  const means = rollingAverage(values, windowSize);
  const stds = movingStdDev(values, windowSize);
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    const mean = means[i] ?? 0;
    const sd = stds[i] ?? 0;
    if (sd === 0) continue;
    const z = Math.abs((v - mean) / sd);
    if (z >= zThreshold) anomalies.push(i);
  }
  return anomalies;
}

export default {
  rollingAverage,
  movingStdDev,
  detectAnomalies,
};

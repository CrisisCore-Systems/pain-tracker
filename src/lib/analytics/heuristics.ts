// Shared heuristic + statistical helpers for analytics & workers
export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

export function movingAverage(values: number[], window = 3): number[] {
  if (window <= 1) return [...values];
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    out.push(slice.reduce((s, v) => s + v, 0) / slice.length || 0);
  }
  return out;
}

export function linearRegression(values: number[]): RegressionResult {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };
  const xs = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = xs.reduce((s, v) => s + v, 0);
  const sumY = values.reduce((s, v) => s + v, 0);
  const sumXY = xs.reduce((s, v, i) => s + v * values[i], 0);
  const sumXX = xs.reduce((s, v) => s + v * v, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  // r2
  const mean = sumY / n;
  const ssTot = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0);
  const ssRes = values.reduce((s, v, i) => s + Math.pow(v - (slope * xs[i] + intercept), 2), 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || y.length !== n) return 0;
  const sumX = x.reduce((s, v) => s + v, 0);
  const sumY = y.reduce((s, v) => s + v, 0);
  const sumXY = x.reduce((s, v, i) => s + v * y[i], 0);
  const sumXX = x.reduce((s, v) => s + v * v, 0);
  const sumYY = y.reduce((s, v) => s + v * v, 0);
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  return den === 0 ? 0 : num / den;
}

export function detectStdDevAnomalies(values: number[], threshold = 1.5): number[] {
  if (values.length < 2) return [];
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  const sd = Math.sqrt(variance);
  return values
    .map((v, i) => ({ v, i }))
    .filter(o => Math.abs(o.v - mean) > sd * threshold)
    .map(o => o.i);
}

export function keywordHitCount(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const kw of keywords) if (lower.includes(kw)) hits++;
  return hits;
}

export function aggregateKeywordDensity(notes: string[], keywords: string[]): number {
  if (notes.length === 0) return 0;
  let hits = 0;
  for (const n of notes) hits += keywordHitCount(n, keywords);
  return hits / notes.length;
}

export function boundedScore(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

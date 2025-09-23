import { fetchBarometricPressure } from '../services/weather';

// Very small correlation: compute Pearson correlation between pressure series and pain levels
export function pearsonCorrelation(x: number[], y: number[]): number | null {
  if (x.length === 0 || y.length === 0 || x.length !== y.length) return null;
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0);
  const sumY2 = y.reduce((s, yi) => s + yi * yi, 0);
  const numerator = n * sumXY - sumX * sumY;
  const denom = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (denom === 0) return null;
  return numerator / denom;
}

export async function correlatePainWithPressure(entries: { time: string; pain: number; lat?: number; lon?: number }[]) {
  // Try to fetch a single pressure reading if location provided on entries
  const pressures: number[] = [];
  const pains: number[] = [];
  for (const e of entries) {
    if (typeof e.pain !== 'number') continue;
    pains.push(e.pain);
    if (typeof e.lat === 'number' && typeof e.lon === 'number') {
      const p = await fetchBarometricPressure(e.lat, e.lon);
      pressures.push(p ?? NaN);
    } else {
      pressures.push(NaN);
    }
  }
  // Filter pairs where pressure is a number
  const validX: number[] = [];
  const validY: number[] = [];
  for (let i = 0; i < pressures.length; i++) {
    const p = pressures[i];
    if (Number.isFinite(p)) {
      validX.push(p);
      validY.push(pains[i]);
    }
  }
  const corr = pearsonCorrelation(validX, validY);
  return { correlation: corr, count: validX.length };
}

import type { PainEntry } from '../../../types';

import { rollingAverage, movingStdDev, detectAnomalies } from '../../../utils/analytics';
import { ChartPointMetaArray } from '../../../design-system/types/chart';

export function generateTrendData(entries: PainEntry[], type: string) {
  const dataByDate: { [key: string]: number[] } = {};

  entries.forEach(entry => {
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    if (!dataByDate[date]) dataByDate[date] = [];

    if (type === 'pain') {
      dataByDate[date].push(entry.baselineData.pain);
    }
  });

  return Object.entries(dataByDate).map(([date, values]) => ({
    date,
    value: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null,
  }));
}

export function generateFrequencyData(entries: PainEntry[], days: number) {
  const data: Array<{ date: string; value: number }> = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const count = entries.filter(
      entry => new Date(entry.timestamp).toISOString().split('T')[0] === dateStr
    ).length;

    data.push({ date: dateStr, value: count });
  }

  return data;
}

export function calculateIntensityDistribution(entries: PainEntry[]) {
  const ranges = [
    { min: 0, max: 2, label: 'Mild (0-2)', count: 0 },
    { min: 3, max: 5, label: 'Moderate (3-5)', count: 0 },
    { min: 6, max: 8, label: 'Severe (6-8)', count: 0 },
    { min: 9, max: 10, label: 'Extreme (9-10)', count: 0 },
  ];

  entries.forEach(entry => {
    const pain = entry.baselineData.pain;
    const range = ranges.find(r => pain >= r.min && pain <= r.max);
    if (range) range.count++;
  });

  const total = entries.length;
  const variance =
    total > 0
      ? ranges.reduce((acc, range) => {
          const proportion = range.count / total;
          return acc + proportion * proportion;
        }, 0)
      : 0;

  return {
    variance: Math.sqrt(variance),
    data: ranges.map(range => ({
      label: range.label,
      value: range.count,
      percentage: total > 0 ? (range.count / total) * 100 : 0,
    })),
  };
}

export function calculateSymptomCorrelation(entries: PainEntry[]) {
  const symptomPainMap: { [key: string]: number[] } = {};

  entries.forEach(entry => {
    const pain = entry.baselineData.pain;
    const symptoms = entry.baselineData.symptoms || [];

    symptoms.forEach(symptom => {
      if (!symptomPainMap[symptom]) symptomPainMap[symptom] = [];
      symptomPainMap[symptom].push(pain);
    });
  });

  const correlations = Object.entries(symptomPainMap)
    .map(([symptom, pains]) => ({
      symptom,
      avgPain: pains.reduce((a, b) => a + b, 0) / pains.length,
      count: pains.length,
    }))
    .sort((a, b) => b.avgPain - a.avgPain);

  return {
    strength: correlations.length > 0 ? correlations[0].avgPain : 0,
    data: correlations.slice(0, 5),
  };
}

export function calculateQOLImpact(entries: PainEntry[]) {
  const qolEntries = entries.filter(e => e.qualityOfLife);
  if (qolEntries.length === 0) return { average: 0, change: 0, trendData: [] };

  const avgSleep =
    qolEntries.reduce((sum, e) => sum + (e.qualityOfLife?.sleepQuality || 0), 0) /
    qolEntries.length;
  const avgMood =
    qolEntries.reduce((sum, e) => sum + (e.qualityOfLife?.moodImpact || 0), 0) / qolEntries.length;

  const average = (avgSleep + avgMood) / 2;
  const change = 0;

  const trendData = qolEntries.map(entry => ({
    date: new Date(entry.timestamp).toISOString().split('T')[0],
    sleep: entry.qualityOfLife?.sleepQuality || 0,
    mood: entry.qualityOfLife?.moodImpact || 0,
    average:
      ((entry.qualityOfLife?.sleepQuality || 0) + (entry.qualityOfLife?.moodImpact || 0)) / 2,
  }));

  return { average, change, trendData };
}

export function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;

  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return slope;
}

export function detectPatterns(entries: PainEntry[]) {
  const timePatterns: { [key: string]: { pains: number[]; count: number } } = {};

  entries.forEach(entry => {
    const hour = new Date(entry.timestamp).getHours();
    const timeSlot =
      hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

    if (!timePatterns[timeSlot]) {
      timePatterns[timeSlot] = { pains: [], count: 0 };
    }

    timePatterns[timeSlot].pains.push(entry.baselineData.pain);
    timePatterns[timeSlot].count++;
  });

  const avgByTime = Object.entries(timePatterns)
    .map(([time, data]) => ({
      time,
      avgPain: data.pains.reduce((a, b) => a + b, 0) / data.pains.length,
      count: data.count,
    }))
    .sort((a, b) => b.avgPain - a.avgPain);

  if (avgByTime.length > 0 && avgByTime[0].count >= 3) {
    return {
      timeOfDay: {
        time: avgByTime[0].time,
        avgPain: avgByTime[0].avgPain,
        confidence: Math.min((avgByTime[0].count / entries.length) * 100, 90),
      },
    };
  }

  return {};
}

export function generateForecast(entries: PainEntry[]) {
  if (entries.length < 7) return { predictedAvg: 0, confidence: 0 };

  const recent = entries.slice(-7);
  const avgPain = recent.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / recent.length;

  const trend = calculateTrend(recent.map(e => e.baselineData.pain));
  const predictedAvg = Math.max(0, Math.min(10, avgPain + trend * 7));

  const confidence = Math.min(recent.length * 10, 85);

  return { predictedAvg, confidence };
}

export function buildDailyAggregates(entries: PainEntry[]) {
  const map: Record<string, { values: number[]; count: number; notes: number; meds: number }> = {};
  entries.forEach(e => {
    const date = new Date(e.timestamp).toISOString().split('T')[0];
    if (!map[date]) map[date] = { values: [], count: 0, notes: 0, meds: 0 };
    map[date].values.push(e.baselineData.pain);
    map[date].count += 1;
    if ((e as any).notes) map[date].notes += 1;
    if ((e as any).medications && (e as any).medications.length > 0) map[date].meds += 1;
  });
  const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  const agg = sorted.map(([date, meta]) => ({
    date,
    value: meta.values.reduce((s, v) => s + v, 0) / meta.values.length,
  }));
  const meta = sorted.map(([date, m]) => ({ date, count: m.count, notes: m.notes, meds: m.meds }));
  return { dailyAverages: agg, dailyMeta: meta as ChartPointMetaArray };
}

export default {
  generateTrendData,
  generateFrequencyData,
  calculateIntensityDistribution,
  calculateSymptomCorrelation,
  calculateQOLImpact,
  calculateTrend,
  detectPatterns,
  generateForecast,
  buildDailyAggregates,
};

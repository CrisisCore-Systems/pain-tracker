import React from 'react';
// Mock implementations for predictive services
const predictFlareUp = (entries: PainEntry[]) => {
  if (!entries || entries.length === 0) return { score: 0, reason: 'No data available' };
  const recent = entries.slice(-7);
  const avg = recent.reduce((sum, e) => sum + e.baselineData.pain, 0) / recent.length;
  const score = Math.min(1, avg / 10);
  return { score, reason: score > 0.5 ? 'Elevated pain levels detected' : 'Normal pain levels' };
};

const suggestCopingStrategies = (score: number) => {
  if (score > 0.7) return ['Rest and consult healthcare provider', 'Use pain management techniques'];
  if (score > 0.4) return ['Monitor symptoms closely', 'Consider preventive measures'];
  return ['Maintain healthy habits', 'Continue regular monitoring'];
};

const riskTrendOverDays = (entries: PainEntry[], days: number) => {
  return Array.from({ length: days }, (_, i) => ({
    label: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
    score: Math.floor(Math.random() * 100)
  }));
};

const analyzeTriggers = (entries: PainEntry[], days: number) => {
  // Mock trigger analysis
  return [
    { name: 'Weather changes', confidence: 75, detail: 'Cold weather correlation' },
    { name: 'Sleep quality', confidence: 60, detail: 'Poor sleep patterns' }
  ];
};

// import { predictFlareUp, suggestCopingStrategies, riskTrendOverDays } from '@pain-tracker/services/predictions';
// import { analyzeTriggers } from '@pain-tracker/services/triggerAnalysis';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';
import type { PainEntry } from '../types';
import TrendChart from './TrendChart';

export default function PredictivePanel({ entries }: { entries: PainEntry[] }) {
  const { score, reason } = predictFlareUp(entries);
  const strategies = suggestCopingStrategies(score);
  const trend = riskTrendOverDays(entries, 7);
  const triggers = analyzeTriggers(entries, 30).slice(0,2);

  return (
    <div className="mb-4">
      <Card className="relative">
        <CardHeader>
          <CardTitle>Predicted Flare-up Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Risk: {(score*100).toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">{reason}</div>
              </div>
              <div style={{ width: 200 }}>
                <div className="h-3 bg-muted rounded overflow-hidden">
                  <div
                    className={`h-3 rounded`}
                    style={{ width: `${Math.round(score*100)}%`, background: score < 0.4 ? 'linear-gradient(90deg,#34d399,#10b981)' : score < 0.7 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'linear-gradient(90deg,#fb7185,#ef4444)' }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <TrendChart labels={trend.map(t => t.label)} data={trend.map(t => t.score)} height={80} />
            </div>
          </div>

          <div>
            {triggers.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium">Top triggers</div>
                <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">
                  {triggers.map(t => (
                    <li key={t.name}>{t.name} — {t.confidence}% ({t.detail})</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-sm font-medium mb-2">Suggested actions</div>
            <ul className="mt-1 list-disc list-inside text-sm space-y-1">
              {strategies.map(s => (
                <li key={s} className="text-muted-foreground">{s}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

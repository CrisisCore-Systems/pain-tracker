import React from 'react';
import { predictFlareUp, suggestCopingStrategies, riskTrendOverDays } from '../services/predictions';
import { analyzeTriggers } from '../services/triggerAnalysis';
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

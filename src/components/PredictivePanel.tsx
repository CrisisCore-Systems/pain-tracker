import { pickVariant } from '@pain-tracker/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';
import type { PainEntry } from '../types';
import TrendChart from './TrendChart';

// Mock implementations for predictive services

const predictFlareUp = (entries: PainEntry[]) => {
  if (!entries || entries.length === 0) return { score: 0, reason: 'No data available' };
  const recent = entries.slice(-7).map(e => e.baselineData.pain);
  const avg = recent.reduce((s, v) => s + v, 0) / recent.length;
  const last = recent[recent.length - 1];
  const max = Math.max(...recent);

  // Simple, deterministic heuristic
  let score = 0;
  if (last >= 7) score += 0.5;
  if (last > avg) score += 0.3;
  if (max >= 8) score += 0.2;
  score = Math.min(1, score);

  const factors: string[] = [];
  if (last >= 7) factors.push('today is in the high range');
  if (last > avg + 0.5) factors.push(`today is above your recent average (${avg.toFixed(1)}/10)`);
  if (max >= 8) factors.push('you’ve had at least one very high day recently');

  const seed = `${Math.round(score * 100)}|${Math.round(avg * 10)}|${Math.round(last * 10)}|${Math.round(max * 10)}`;
  const highPrefix = pickVariant(seed, ['Higher flare-up risk', 'Elevated flare-up risk', 'Stronger flare-up risk signal']);
  const medPrefix = pickVariant(seed, ['Moderate risk signal', 'Mild-to-moderate risk signal', 'Some risk signal']);
  const lowMessage = pickVariant(seed, [
    'No strong flare-up signals in the last week based on pain level alone.',
    'No clear flare-up pattern shows up in the last week from pain level alone.',
    'No strong risk signal detected from pain level alone over the last week.',
  ]);

  const reason =
    score > 0.6
      ? `${highPrefix}: ${factors.join(', ')}.`
      : score > 0.3
        ? `${medPrefix}: ${factors.length ? factors.join(', ') : 'a mild upward drift'}.`
        : lowMessage;

  return { score, reason };
};

const suggestCopingStrategies = (score: number) => {
  if (score > 0.7)
    return ['Rest and consult healthcare provider', 'Use pain management techniques'];
  if (score > 0.4) return ['Monitor symptoms closely', 'Consider preventive measures'];
  return ['Maintain healthy habits', 'Continue regular monitoring'];
};

const riskTrendOverDays = (_entries: PainEntry[], days: number) => {
  // Deterministic placeholder: gently follows overall risk level
  const base = Math.round(predictFlareUp(_entries).score * 100);
  return Array.from({ length: days }, (_, i) => {
    const dayOffset = days - 1 - i;
    const drift = Math.round((dayOffset - (days - 1) / 2) * 2); // small, stable variation
    const score = Math.max(0, Math.min(100, base + drift));
    return {
      label: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      score,
    };
  });
};

const analyzeTriggers = (_entries: PainEntry[], _days: number) => {
  // Mock trigger analysis
  return [
    { name: 'Weather changes', confidence: 75, detail: 'Cold weather correlation' },
    { name: 'Sleep quality', confidence: 60, detail: 'Poor sleep patterns' },
  ];
};

// import { predictFlareUp, suggestCopingStrategies, riskTrendOverDays } from '@pain-tracker/services/predictions';
// import { analyzeTriggers } from '@pain-tracker/services/triggerAnalysis';

export default function PredictivePanel({ entries }: { entries: PainEntry[] }) {
  const { score, reason } = predictFlareUp(entries);
  const strategies = suggestCopingStrategies(score);
  const trend = riskTrendOverDays(entries, 7);
  const triggers = analyzeTriggers(entries, 30).slice(0, 2);

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
                <div className="text-lg font-semibold">Risk: {(score * 100).toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">{reason}</div>
              </div>
              <div style={{ width: 200 }}>
                <div className="h-3 bg-muted rounded overflow-hidden">
                  <div
                    className={`h-3 rounded`}
                    style={{
                      width: `${Math.round(score * 100)}%`,
                      background:
                        score < 0.4
                          ? 'linear-gradient(90deg,#34d399,#10b981)'
                          : score < 0.7
                            ? 'linear-gradient(90deg,#f59e0b,#f97316)'
                            : 'linear-gradient(90deg,#fb7185,#ef4444)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <TrendChart
                labels={trend.map(t => t.label)}
                data={trend.map(t => t.score)}
                height={80}
              />
            </div>
          </div>

          <div>
            {triggers.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium">Top triggers</div>
                <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">
                  {triggers.map(t => (
                    <li key={t.name}>
                      {t.name} — {t.confidence}% ({t.detail})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-sm font-medium mb-2">Suggested actions</div>
            <ul className="mt-1 list-disc list-inside text-sm space-y-1">
              {strategies.map(s => (
                <li key={s} className="text-muted-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

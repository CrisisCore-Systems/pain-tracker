import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { painAnalyticsService } from '../../services/PainAnalyticsService';
import Chart from '../../design-system/components/Chart';
import { colorVar } from '../../design-system/utils/theme';
import type { PainEntry } from '../../types';
import { cn } from '../../design-system/utils';
import { Pill } from 'lucide-react';

interface MedicationEffectivenessChartProps {
  entries: PainEntry[];
  className?: string;
}

export function MedicationEffectivenessChart({ entries, className }: MedicationEffectivenessChartProps) {
  const data = useMemo(() => {
    // Only analyze if we have enough data
    if (entries.length < 5) return [];
    
    const correlations = painAnalyticsService.analyzeCorrelations(entries);
    return correlations.medicationEffectiveness;
  }, [entries]);

  if (data.length === 0) return null;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Pill className="h-5 w-5 text-blue-500" />
          <span>Medication Effectiveness</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Chart
          data={{
            labels: data.map(d => d.medication),
            datasets: [
              {
                label: 'Effectiveness Score (1-5)',
                data: data.map(d => d.effectivenessScore),
                backgroundColor: colorVar('color-primary'),
                type: 'bar',
                yAxisID: 'y',
              },
              {
                label: 'Pain Reduction',
                data: data.map(d => d.painReduction),
                backgroundColor: colorVar('color-accent'),
                type: 'line',
                yAxisID: 'y1',
              }
            ],
          }}
          type="bar" // Mixed chart type base
          height={300}
        />
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Comparison of reported effectiveness vs observed pain reduction
        </div>
      </CardContent>
    </Card>
  );
}

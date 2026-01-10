import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { painAnalyticsService } from '../../services/PainAnalyticsService';
import Chart from '../../design-system/components/Chart';
import { colorVar } from '../../design-system/utils/theme';
import type { PainEntry } from '../../types';
import { cn } from '../../design-system/utils';
import { Activity } from 'lucide-react';

interface ActivityCorrelationChartProps {
  entries: PainEntry[];
  className?: string;
}

export function ActivityCorrelationChart({ entries, className }: ActivityCorrelationChartProps) {
  const data = useMemo(() => {
    if (entries.length < 5) return [];
    
    const correlations = painAnalyticsService.analyzeCorrelations(entries);
    // Sort by most impactful (highest avg pain)
    return correlations.activityCorrelations
      .sort((a, b) => b.painImpact - a.painImpact)
      .slice(0, 10); // Top 10
  }, [entries]);

  if (data.length === 0) return null;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-orange-500" />
          <span>Activity Impact Correlation</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Chart
          data={{
            labels: data.map(d => d.activity),
            datasets: [
              {
                label: 'Average Pain Score',
                data: data.map(d => d.painImpact),
                backgroundColor: colorVar('color-danger'),
                type: 'bar',
              }
            ],
          }}
          type="bar"
          height={300}
        />
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Activities associated with higher average pain levels
        </div>
      </CardContent>
    </Card>
  );
}

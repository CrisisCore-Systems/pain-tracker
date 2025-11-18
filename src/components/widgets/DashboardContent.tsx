import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import Chart from '../../design-system/components/Chart';
import { BarChart3, TrendingUp } from 'lucide-react';
import { buildRolling7DayChartData, RawEntry } from '../../design-system/utils/chart';
import type { PainEntry } from '../../types';
import { cn } from '../../design-system/utils';
import { formatNumber } from '../../utils/formatting';
import { isSameLocalDay, localDayStart } from '../../utils/dates';

interface DashboardContentProps {
  entries: PainEntry[];
  allEntries?: PainEntry[];
}

export function DashboardContent({ entries, allEntries }: DashboardContentProps) {
  // For this refactor we reuse the existing metrics logic (simplified) and render the charts
  const metrics = useMemo(() => {
    const totalEntries = allEntries?.length ?? entries.length;
    const averagePain =
      entries.length > 0
        ? entries.reduce((s, e) => s + e.baselineData.pain, 0) / entries.length
        : 0;
    const weekly = entries.slice(-7);
    const weeklyAvg =
      weekly.length > 0 ? weekly.reduce((s, e) => s + e.baselineData.pain, 0) / weekly.length : 0;

    const painRanges = [0, 0, 0, 0];
    entries.forEach(e => {
      const p = e.baselineData.pain;
      if (p <= 2) painRanges[0]++;
      else if (p <= 5) painRanges[1]++;
      else if (p <= 8) painRanges[2]++;
      else painRanges[3]++;
    });

    const rolling = buildRolling7DayChartData(
      entries.map(e => ({ created_at: e.timestamp, pain_level: e.baselineData.pain }) as RawEntry),
      {} as any
    );

    return { totalEntries, averagePain, weeklyAvg, painRanges, rolling };
  }, [entries, allEntries]);

  return (
    <div className="space-y-6">
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        style={{ gap: 'var(--dashboard-gap)' }}
      >
        <Card>
          <CardContent>Total Entries: {metrics.totalEntries}</CardContent>
        </Card>
        <Card>
          <CardContent>Avg Pain: {formatNumber(Number(metrics.averagePain), 1)}</CardContent>
        </Card>
        <Card>
          <CardContent>Weekly Avg: {formatNumber(Number(metrics.weeklyAvg), 1)}</CardContent>
        </Card>
        <Card>
          <CardContent>
            This dashboard area is under active development. For planned widgets, status, and links
            to issues you can help with, see the project's feature matrix.
            <a
              className="ml-1 text-primary underline"
              href="/docs/FEATURE_MATRIX.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Feature Matrix
            </a>
            <div className="sr-only">Opens docs/FEATURE_MATRIX.md in repository</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Pain Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              data={{
                labels: ['Mild', 'Moderate', 'Severe', 'Extreme'],
                datasets: [{ label: 'Entries', data: metrics.painRanges }],
              }}
              type="bar"
              height={200}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Weekly Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              data={{
                labels: metrics.rolling.labels || [],
                datasets: metrics.rolling.datasets || [],
              }}
              type="line"
              height={200}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardContent;

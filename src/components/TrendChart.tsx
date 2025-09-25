import React from 'react';
import Chart from '../design-system/components/Chart';
import { chartColors, getChartColorAlpha } from '../design-system/utils/chart-colors';

export default function TrendChart({ labels, data, height = 160 }: { labels: string[]; data: number[]; height?: number }) {
  return (
    <div>
      <Chart
        data={{
          labels,
          datasets: [{ label: 'Pain level', data, borderColor: chartColors.analytics.trend, backgroundColor: getChartColorAlpha(0, 0.2, 'analytics'), fill: true }]
        }}
        type="line"
        height={height}
      />
    </div>
  );
}

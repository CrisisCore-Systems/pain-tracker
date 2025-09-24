import React from 'react';
import Chart from '../design-system/components/Chart';
import { colorVar, colorVarAlpha } from '../design-system/utils/theme';

export default function TrendChart({ labels, data, height = 160 }: { labels: string[]; data: number[]; height?: number }) {
  return (
    <div>
      <Chart
        data={{
          labels,
          datasets: [{ label: 'Pain level', data, borderColor: colorVar('color-primary'), backgroundColor: colorVarAlpha('color-primary', 0.08), fill: true }]
        }}
        type="line"
        height={height}
      />
    </div>
  );
}

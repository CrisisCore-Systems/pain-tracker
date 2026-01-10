import React, { useMemo, useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useReducedMotion } from '../../design-system/utils/accessibility';
import type { PainEntry } from '../../types';
import { useHealthDataStore } from '../../stores/health-data-store';
import { Button } from '../../design-system/components/Button';
import { Activity, Heart } from 'lucide-react';

interface ChartData {
  timestamp: string; // Formatting for display
  rawDate: number;   // Metric for sorting
  pain: number;
  heartRate?: number | null;
  steps?: number | null;
}

interface PainChartProps {
  entries: Pick<PainEntry, 'timestamp' | 'baselineData'>[];
}

export function PainChart({ entries }: PainChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showBiometrics, setShowBiometrics] = useState(false);
  const healthRecords = useHealthDataStore(state => state.records);

  const chartData: ChartData[] = useMemo(() => {
    // 1. Map pain entries to base data points
    const points = entries.map(entry => ({
      timestamp: format(new Date(entry.timestamp), 'MM/dd HH:mm'),
      rawDate: new Date(entry.timestamp).getTime(),
      pain: entry.baselineData.pain,
      heartRate: null as number | null,
    }));

    // 2. If biometrics enabled, try to find matching HR data for each point
    // Logic: Find the avg HR within +/- 30 mins of the pain entry? 
    // Or just overlay all data matched by hour?
    // Simple approach: For each pain entry, find the closest Heart Rate record
    if (showBiometrics && healthRecords.length > 0) {
        const heartRates = healthRecords.filter(r => r.type === 'heart_rate');
        
        points.forEach(p => {
            // Find closest HR sample within 1 hour
            const relevant = heartRates.filter(hr => {
                const hrTime = parseISO(hr.startDate).getTime();
                return Math.abs(hrTime - p.rawDate) < 60 * 60 * 1000; // 1 hour window
            });

            if (relevant.length > 0) {
                // Average them
                const avg = relevant.reduce((sum, r) => sum + r.value, 0) / relevant.length;
                p.heartRate = Math.round(avg);
            }
        });
    }

    return points.sort((a, b) => a.rawDate - b.rawDate);
  }, [entries, healthRecords, showBiometrics]);

  return (
    <div className="bg-card w-full h-full">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold dark:text-gray-100">Pain History</h2>
          {healthRecords.length > 0 && (
             <Button 
                size="sm" 
                variant={showBiometrics ? 'default' : 'outline'}
                onClick={() => setShowBiometrics(!showBiometrics)}
                title="Toggle Heart Rate Overlay"
             >
                <Heart className={`h-4 w-4 mr-2 ${showBiometrics ? 'fill-current' : ''}`} />
                {showBiometrics ? 'Hide HR' : 'Show HR'}
             </Button>
          )}
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(val) => val.split(' ')[0]} // Show date only on axis to save space
            />
            {/* Left Axis: Pain (0-10) */}
            <YAxis yAxisId="pain" domain={[0, 10]} />
            
            {/* Right Axis: Heart Rate (40-160) - Hidden if disabled */}
            {showBiometrics && (
                <YAxis yAxisId="hr" orientation="right" domain={[40, 160]} hide={!showBiometrics} />
            )}

            <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
            
            <Line
              yAxisId="pain"
              type="monotone"
              dataKey="pain"
              name="Pain Level"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ r: 4, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 6 }}
              isAnimationActive={!prefersReducedMotion}
            />

            {showBiometrics && (
                <Line
                    yAxisId="hr"
                    type="monotone"
                    dataKey="heartRate"
                    name="Avg Heart Rate"
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    opacity={0.7}
                    isAnimationActive={!prefersReducedMotion}
                />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

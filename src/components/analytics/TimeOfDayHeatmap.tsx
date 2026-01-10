import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { painAnalyticsService } from '../../services/PainAnalyticsService';
import type { PainEntry } from '../../types';
import { cn } from '../../design-system/utils';

interface TimeOfDayHeatmapProps {
  entries: PainEntry[];
  className?: string;
  days?: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function TimeOfDayHeatmap({ entries, className, days = 90 }: TimeOfDayHeatmapProps) {
  const data = useMemo(() => {
    return painAnalyticsService.generateTimeHeatmap(entries, days);
  }, [entries, days]);

  // Find max pain for color scaling
  const maxPain = Math.max(...data.map((d: { avgPain: number }) => d.avgPain), 0.1); // Avoid div by zero

  const getColor = (avgPain: number, count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'; // No data
    
    // Simple heatmap scale: Green -> Yellow -> Red
    // Using HSL for easier gradients
    // Green (120) -> Red (0)
    const normalizedPain = Math.min(avgPain / 10, 1);
    const hue = ((1 - normalizedPain) * 120).toString(10);
    
    // Opacity based on confidence (count)? Or just solid?
    // Let's use solid color for clarity in pain context
    return `hsl(${hue}, 70%, 60%)`;
  };

  const getIntensityClass = (avgPain: number, count: number) => {
      if (count === 0) return 'bg-gray-50/50 dark:bg-white/5';
      if (avgPain < 2) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      if (avgPain < 4) return 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200';
      if (avgPain < 6) return 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
      if (avgPain < 8) return 'bg-orange-300 dark:bg-orange-900/50 text-orange-900 dark:text-orange-200';
      return 'bg-red-400 dark:bg-red-900/60 text-white dark:text-red-100 font-bold';
  };

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-lg">
           <span>Temporal Patterns (Last {days} Days)</span>
           <span className="text-xs font-normal text-muted-foreground">Avg Pain (0-10)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-4 overflow-x-auto">
        <div className="min-w-[600px] text-xs">
          {/* Header Row */}
          <div className="flex">
             <div className="w-12 shrink-0"></div>
             {HOURS.map(h => (
               <div key={h} className="flex-1 text-center text-muted-foreground p-1 border-b border-border">
                  {h === 0 || h === 6 || h === 12 || h === 18 ? h : ''}
               </div>
             ))}
          </div>

          {/* Rows */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex h-8 border-b border-border/50">
              <div className="w-12 shrink-0 flex items-center justify-end pr-2 font-medium text-muted-foreground border-r border-border">
                {day}
              </div>
              {HOURS.map(hour => {
                const point = data.find((p: { dayIndex: number; hour: number }) => p.dayIndex === dayIndex && p.hour === hour);
                const pain = point?.avgPain || 0;
                const count = point?.count || 0;
                
                return (
                  <div 
                    key={hour} 
                    className={cn(
                        "flex-1 flex items-center justify-center transition-colors hover:ring-1 hover:ring-primary/50 relative group cursor-default",
                        getIntensityClass(pain, count)
                    )}
                    title={`${day} ${hour}:00 - Avg Pain: ${pain.toFixed(1)} (${count} entries)`}
                  >
                     {count > 0 && pain >= 7 && (
                         <span className="text-[9px] font-bold">!</span>
                     )}
                     
                     {/* Tooltip-ish overlay could go here, but using title for accessiblity simplicity first */}
                  </div>
                );
              })}
            </div>
          ))}
          
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-50 dark:bg-white/5 border border-border"></div> No Data</div>
             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 dark:bg-green-900/30"></div> Low (0-3)</div>
             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-900/50"></div> Moderate (4-6)</div>
             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 dark:bg-red-900/60"></div> Severe (7-10)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

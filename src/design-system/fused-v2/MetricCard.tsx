import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../utils';
import '../tokens/fused-v2.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  sparkline?: number[];
  severity?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  unit?: string;
  className?: string;
  compact?: boolean;
}

export function MetricCard({
  title,
  value,
  delta,
  sparkline,
  severity,
  unit,
  className,
  compact = false,
}: MetricCardProps) {
  const getSeverityColor = (level: number) => {
    return `var(--severity-${level})`;
  };

  const getDeltaIcon = () => {
    if (!delta) return null;

    switch (delta.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getDeltaColor = () => {
    if (!delta) return 'text-ink-400';

    // For pain metrics, down is good
    if (delta.direction === 'down') return 'text-good-500';
    if (delta.direction === 'up') return 'text-bad-500';
    return 'text-ink-400';
  };

  return (
    <div
      className={cn(
        'surface-card transition-all duration-[var(--duration-fast)]',
        'hover:surface-elevated hover:shadow-[var(--elevation-2)]',
        compact && 'p-4',
        className
      )}
    >
      {/* Title */}
      <div className="text-small text-ink-300 mb-2">{title}</div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className={cn(compact ? 'text-h2' : 'text-display', 'text-mono text-ink-50')}>
          {value}
        </span>
        {unit && <span className="text-small text-ink-400">{unit}</span>}
      </div>

      {/* Delta */}
      {delta && (
        <div className={cn('flex items-center gap-1 text-small', getDeltaColor())}>
          {getDeltaIcon()}
          <span className="text-mono">
            {delta.value > 0 ? '+' : ''}
            {delta.value.toFixed(1)}
          </span>
          {delta.label && <span className="text-ink-400">{delta.label}</span>}
        </div>
      )}

      {/* Sparkline (simple SVG) */}
      {sparkline && sparkline.length > 1 && (
        <div className="mt-3 h-8">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 32"
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            <polyline
              fill="none"
              stroke="var(--primary-500)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparkline
                .map((val, i) => {
                  const x = (i / (sparkline.length - 1)) * 100;
                  const max = Math.max(...sparkline);
                  const min = Math.min(...sparkline);
                  const range = max - min || 1;
                  const y = 32 - ((val - min) / range) * 28;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          </svg>
        </div>
      )}

      {/* Severity Bar */}
      {severity !== undefined && (
        <div className="mt-3 h-1 bg-surface-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-[var(--duration-normal)]"
            style={{
              width: `${(severity / 10) * 100}%`,
              backgroundColor: getSeverityColor(severity),
            }}
          />
        </div>
      )}
    </div>
  );
}

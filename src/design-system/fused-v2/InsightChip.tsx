import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { cn } from '../utils';
import '../tokens/fused-v2.css';

interface InsightChipProps {
  statement: string;
  confidence: 1 | 2 | 3; // 1-3 dots
  rationale: string;
  onDismiss?: () => void;
  className?: string;
}

export function InsightChip({
  statement,
  confidence,
  rationale,
  onDismiss,
  className
}: InsightChipProps) {
  const [showPopover, setShowPopover] = useState(false);

  const getConfidenceDots = () => {
    return Array.from({ length: 3 }, (_, i) => (
      <div
        key={i}
        className={cn(
          'w-1.5 h-1.5 rounded-full transition-colors',
          i < confidence ? 'bg-primary-500' : 'bg-surface-600'
        )}
      />
    ));
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]',
        'bg-surface-700 border border-surface-600',
        'text-small text-ink-100',
        'transition-all duration-[var(--duration-fast)]',
        'hover:bg-surface-600 hover:border-primary-500/30'
      )}>
        {/* Statement */}
        <span className="flex-1">{statement}</span>

        {/* Confidence Dots */}
        <div className="flex items-center gap-0.5">
          {getConfidenceDots()}
        </div>

        {/* Info Button */}
        <button
          onClick={() => setShowPopover(!showPopover)}
          className={cn(
            'p-1 rounded hover:bg-surface-500 transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500'
          )}
          aria-label="Show insight details"
        >
          <Info className="w-3.5 h-3.5 text-ink-400" />
        </button>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              'p-1 rounded hover:bg-surface-500 transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500'
            )}
            aria-label="Dismiss insight"
          >
            <X className="w-3.5 h-3.5 text-ink-400" />
          </button>
        )}
      </div>

      {/* Popover */}
      {showPopover && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[var(--z-popover)]"
            onClick={() => setShowPopover(false)}
          />

          {/* Popover Content */}
          <div className={cn(
            'absolute left-0 top-full mt-2 z-[calc(var(--z-popover)+1)]',
            'w-80 max-w-[90vw]',
            'bg-surface-700 border border-surface-500 rounded-[var(--radius-xl)]',
            'shadow-[var(--elevation-3)] p-4',
            'animate-in fade-in-0 slide-in-from-top-2 duration-[var(--duration-fast)]'
          )}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h4 className="text-body-medium text-ink-50">Why this insight?</h4>
              <button
                onClick={() => setShowPopover(false)}
                className="p-1 rounded hover:bg-surface-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-ink-400" />
              </button>
            </div>

            <p className="text-small text-ink-200 leading-relaxed mb-3">
              {rationale}
            </p>

            {/* Confidence Explanation */}
            <div className="flex items-center gap-2 text-tiny text-ink-400">
              <span>Confidence:</span>
              <div className="flex items-center gap-1">
                {getConfidenceDots()}
              </div>
              <span>
                {confidence === 3 ? 'High' : confidence === 2 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

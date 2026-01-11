import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  className,
}: InsightChipProps) {
  const [showPopover, setShowPopover] = useState(false);
  const originalBodyOverflowRef = useRef<string | null>(null);

  useEffect(() => {
    if (!showPopover) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPopover(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    if (originalBodyOverflowRef.current === null) {
      originalBodyOverflowRef.current = document.body.style.overflow;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (originalBodyOverflowRef.current !== null) {
        document.body.style.overflow = originalBodyOverflowRef.current;
        originalBodyOverflowRef.current = null;
      }
    };
  }, [showPopover]);

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
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]',
          'bg-surface-700 border border-surface-600',
          'text-small text-ink-100',
          'transition-all duration-[var(--duration-fast)]',
          'hover:bg-surface-600 hover:border-primary-500/30'
        )}
      >
        {/* Statement */}
        <span className="flex-1">{statement}</span>

        {/* Confidence Dots */}
        <div className="flex items-center gap-0.5">{getConfidenceDots()}</div>

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

      {/* Details Modal (portal) */}
      {showPopover && typeof document !== 'undefined'
        ? createPortal(
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[var(--z-modal)] bg-black/70"
                onClick={() => setShowPopover(false)}
                aria-hidden="true"
              />

              {/* Modal Content */}
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Insight details"
                className={cn(
                  'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                  'z-[calc(var(--z-modal)+1)]',
                  'w-[min(28rem,calc(100vw-2rem))]',
                  'bg-surface-800 border border-surface-500 rounded-[var(--radius-xl)]',
                  'shadow-[var(--elevation-3)] p-4',
                  'animate-in fade-in-0 zoom-in-95 duration-[var(--duration-fast)]'
                )}
              >
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

                <p className="text-small text-ink-200 leading-relaxed mb-3">{rationale}</p>

                {/* Confidence Explanation */}
                <div className="flex items-center gap-2 text-tiny text-ink-400">
                  <span>Confidence:</span>
                  <div className="flex items-center gap-1">{getConfidenceDots()}</div>
                  <span>{confidence === 3 ? 'High' : confidence === 2 ? 'Medium' : 'Low'}</span>
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  );
}

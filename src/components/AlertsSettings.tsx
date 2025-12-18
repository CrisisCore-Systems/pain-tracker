import React, { useEffect, useState, useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { cn } from '../design-system/utils';

const STORAGE_KEY = 'pain-tracker:alerts-settings';

type Settings = { threshold: number };

type AlertsSettingsProps = {
  variant?: 'overlay' | 'inline';
  className?: string;
  onClose?: () => void;
};

export default function AlertsSettings({
  variant = 'overlay',
  className,
  onClose,
}: AlertsSettingsProps) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { threshold: 3 };
    } catch {
      return { threshold: 3 };
    }
  });
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore localStorage errors
    }
  }, [settings]);

  useEffect(() => {
    if (variant === 'inline') {
      return;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (open) {
      prevActiveRef.current = document.activeElement as HTMLElement | null;
      if (prefersReduced) {
        setSlideIn(true);
        return;
      }
      setSlideIn(false);
      const t = window.setTimeout(() => setSlideIn(true), 10);
      return () => clearTimeout(t);
    } else {
      setSlideIn(false);
      try {
        prevActiveRef.current?.focus();
      } catch {
        // Ignore focus errors
      }
    }
  }, [open, variant]);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const renderBody = (showClose: boolean) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts settings</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">Tune sensitivity for pattern alerts.</p>
        </div>
        {showClose && (
          <button 
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10"
            onClick={handleClose}
          >
            Close
          </button>
        )}
      </div>

      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">Sensitivity (pain increase threshold)</label>
      <input
        type="range"
        min={1}
        max={6}
        value={settings.threshold}
        onChange={e => setSettings({ threshold: Number(e.target.value) })}
        className="w-full accent-amber-500"
      />
      <div className="text-sm text-gray-600 dark:text-slate-300">Current threshold: {settings.threshold} points</div>
      <div className="text-sm text-gray-500 dark:text-slate-400">
        Live preview: You&apos;ll be alerted when pain rises by {settings.threshold} points. For
        example, a baseline of 3/10 would flag entries of {Math.min(10, 3 + settings.threshold)}/10.
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div 
        className={cn('rounded-xl p-5 space-y-3 text-sm bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg', className)}
      >
        {renderBody(false)}
      </div>
    );
  }

  return (
    <>
      <div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg px-3 py-2 text-sm flex items-center gap-2 transition-all"
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M12 2C13.1046 2 14 2.89543 14 4V5.178C16.39 6.006 18 8.388 18 11V16L20 18V19H4V18L6 16V11C6 8.388 7.61 6.006 10 5.178V4C10 2.89543 10.8954 2 12 2Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          Alerts
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100]" role="presentation">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <FocusTrap
            active={true}
            focusTrapOptions={{
              clickOutsideDeactivates: true,
              escapeDeactivates: true,
              onDeactivate: handleClose,
            }}
          >
            <div
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              className={`absolute right-0 top-0 h-full w-full md:w-96 shadow-2xl p-5 overflow-auto transform transition-all duration-200 ${slideIn ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}`}
              style={{
                background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                ...(window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? { transitionTimingFunction: 'linear' }
                  : {}),
              }}
            >
              {renderBody(true)}
            </div>
          </FocusTrap>
        </div>
      )}
    </>
  );
}

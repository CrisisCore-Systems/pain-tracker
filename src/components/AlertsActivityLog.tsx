import React, { useEffect, useState, useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { cn } from '../design-system/utils';

const STORAGE_KEY = 'pain-tracker:alerts-log';

export type AlertRecord = { id: string; time: string; message: string };

export function loadAlerts(): AlertRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // localStorage access failed or invalid JSON
    return [];
  }
}

export function saveAlert(rec: AlertRecord) {
  try {
    const curr = loadAlerts();
    curr.unshift(rec);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(curr.slice(0, 50)));
    window.dispatchEvent(new Event('alerts-log-updated'));
  } catch {
    // localStorage save failed, alert will not be persisted
  }
}

export function clearAlerts() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('alerts-log-updated'));
  } catch {
    // localStorage clear failed
  }
}

export function acknowledgeAlert(id: string) {
  try {
    const curr = loadAlerts().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(curr));
    window.dispatchEvent(new Event('alerts-log-updated'));
  } catch {
    // localStorage update failed
  }
}

type AlertsActivityLogProps = {
  variant?: 'overlay' | 'inline';
  className?: string;
};

export default function AlertsActivityLog({ variant = 'overlay', className }: AlertsActivityLogProps) {
  const [alerts, setAlerts] = useState<AlertRecord[]>(() => loadAlerts());
  const [showingConfirm, setShowingConfirm] = useState(false);
  const [prevAlerts, setPrevAlerts] = useState<AlertRecord[] | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimer = useRef<number | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    const onNew = () => setAlerts(loadAlerts());
    window.addEventListener('alerts-log-updated', onNew);
    return () => window.removeEventListener('alerts-log-updated', onNew);
  }, []);

  useEffect(() => {
    return () => {
      if (undoTimer.current) {
        window.clearTimeout(undoTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (open) {
      prevActiveRef.current = document.activeElement as HTMLElement | null;
      if (prefersReduced) {
        setSlideIn(true);
        return;
      }
      setSlideIn(false);
      const timer = window.setTimeout(() => setSlideIn(true), 10);
      return () => window.clearTimeout(timer);
    }

    setSlideIn(false);
    try {
      prevActiveRef.current?.focus();
    } catch {
      // ignore focus errors
    }
  }, [open]);

  function timeAgo(iso: string) {
    try {
      const then = new Date(iso).getTime();
      const diff = Date.now() - then;
      const seconds = Math.floor(diff / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return new Date(iso).toLocaleString();
    }
  }

  const hasAlerts = alerts.length > 0;

  const handleClose = () => {
    setOpen(false);
    setShowingConfirm(false);
  };

  const handleUndo = () => {
    if (!prevAlerts) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prevAlerts));
      window.dispatchEvent(new Event('alerts-log-updated'));
      setAlerts(prevAlerts);
    } catch {
      // Restore failed
    }

    setPrevAlerts(null);
    setShowUndo(false);
    if (undoTimer.current) {
      window.clearTimeout(undoTimer.current);
      undoTimer.current = null;
    }
  };

  const scheduleUndoHide = () => {
    if (undoTimer.current) {
      window.clearTimeout(undoTimer.current);
    }
    undoTimer.current = window.setTimeout(() => {
      setShowUndo(false);
      setPrevAlerts(null);
      undoTimer.current = null;
    }, 6000);
  };

  const handleConfirmClear = () => {
    const copy = loadAlerts();
    setPrevAlerts(copy);
    clearAlerts();
    setAlerts([]);
    setShowingConfirm(false);
    setShowUndo(true);
    scheduleUndoHide();
    window.setTimeout(() => {
      statusRef.current?.focus();
    }, 10);
  };

  const handleAcknowledge = (id: string) => {
    let shouldDismiss = true;
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      try {
        shouldDismiss = window.confirm('Acknowledge this alert?');
      } catch {
        shouldDismiss = true;
      }
    }

    if (!shouldDismiss) {
      return;
    }

    acknowledgeAlert(id);
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  const renderConfirmDialog = () => (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
    >
      <div className="bg-card p-4 rounded max-w-sm w-full border shadow-lg">
        <div className="font-medium mb-2">Clear all alerts?</div>
        <p className="text-sm text-muted-foreground mb-4">You can undo within a few seconds.</p>
        <div className="flex justify-end space-x-2">
          <button onClick={() => setShowingConfirm(false)} className="px-3 py-1 text-sm">
            Cancel
          </button>
          <button
            onClick={handleConfirmClear}
            className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm"
          >
            Yes, clear
          </button>
        </div>
      </div>
    </div>
  );

  const renderUndoBanner = (context: 'inline' | 'overlay') => {
    if (!showUndo || !prevAlerts) {
      return null;
    }

    const classes =
      context === 'inline'
        ? 'rounded-md border border-primary/40 bg-primary/10 p-3 text-xs flex items-center justify-between'
        : 'mt-4 p-3 rounded-md bg-primary/10 border border-primary/40 text-xs flex items-center justify-between';

    return (
      <div className={classes} role="status" aria-live="polite">
        <span>Alerts cleared.</span>
        <button onClick={handleUndo} className="underline">
          Undo
        </button>
      </div>
    );
  };

  const renderList = (options?: { limit?: number; context?: 'inline' | 'overlay' }) => {
    const { limit, context = 'overlay' } = options ?? {};
    const items = typeof limit === 'number' ? alerts.slice(0, limit) : alerts;

    if (items.length === 0) {
      if (context === 'inline') {
        return (
          <div
            className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
            tabIndex={-1}
            ref={statusRef}
          >
            No recent alerts
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center gap-2 mt-6">
          <div className="text-sm text-muted-foreground" tabIndex={-1} ref={statusRef}>
            No recent alerts
          </div>
          <button
            className="mt-2 px-3 py-1 rounded bg-muted text-foreground text-sm border"
            onClick={handleClose}
            autoFocus
          >
            Close
          </button>
        </div>
      );
    }

    if (context === 'inline') {
      return (
        <ul className="space-y-3 text-sm">
          {items.map((alert) => (
            <li
              key={alert.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-card/80 p-3"
            >
              <div className="space-y-1">
                <div className="font-medium text-foreground">{alert.message}</div>
                <div className="text-xs text-muted-foreground">{timeAgo(alert.time)}</div>
              </div>
              <button className="btn btn-xs" onClick={() => handleAcknowledge(alert.id)}>
                Acknowledge
              </button>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <ul className="text-sm space-y-2">
        {items.map((alert) => (
          <li key={alert.id} className="border rounded p-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{alert.message}</div>
                <div className="text-muted-foreground text-xs" aria-label={new Date(alert.time).toLocaleString()}>
                  {timeAgo(alert.time)}
                </div>
              </div>
              <div className="ml-3 flex flex-col items-end">
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="text-xs text-foreground/80 hover:underline"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderOverlay = () => {
    if (!open) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-[100]" role="presentation">
        <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
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
            className={`absolute right-0 top-0 h-full w-full md:w-96 bg-card shadow-xl border-l p-4 overflow-auto transform transition-all duration-200 ${
              slideIn ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
            }`}
            style={
              typeof window !== 'undefined' &&
              typeof window.matchMedia === 'function' &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? { transitionTimingFunction: 'linear' }
                : undefined
            }
          >
            <button
              id="__alerts-focus-anchor"
              tabIndex={0}
              onFocus={() => {}}
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, margin: 0, padding: 0, border: 0 }}
            />
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Recent Alerts</h3>
              <div className="flex items-center space-x-2">
                <button
                  className="text-xs text-foreground/80 hover:underline mr-2"
                  onClick={() => setShowingConfirm(true)}
                  aria-haspopup="dialog"
                >
                  Clear all
                </button>
                <button className="btn btn-sm" onClick={handleClose}>
                  Close
                </button>
              </div>
            </div>
            {renderList({ context: 'overlay' })}
            {renderUndoBanner('overlay')}
            {showingConfirm && renderConfirmDialog()}
          </div>
        </FocusTrap>
      </div>
    );
  };

  if (variant === 'inline') {
    return (
      <>
        <div className={cn('rounded-lg border bg-muted/30 p-4 space-y-4 text-sm', className)}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground">Recent alerts</h3>
              <p className="text-xs text-muted-foreground">
                Review the latest safety notices and acknowledge them.
              </p>
            </div>
            {hasAlerts && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                {alerts.length}
              </span>
            )}
          </div>

          {renderList({ limit: 4, context: 'inline' })}
          {renderUndoBanner('inline')}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {hasAlerts ? <span>Last update {timeAgo(alerts[0].time)}</span> : <span>Alerts appear here instantly.</span>}
            <div className="flex gap-2">
              <button className="btn btn-xs btn-outline" onClick={() => setOpen(true)}>
                Manage
              </button>
              {hasAlerts && (
                <button className="btn btn-xs" onClick={() => setShowingConfirm(true)}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
        {renderOverlay()}
        {showingConfirm && !open && renderConfirmDialog()}
      </>
    );
  }

  return (
    <>
      <div>
        <button
          onClick={() => setOpen(true)}
          className="relative bg-white border rounded-md px-3 py-2 shadow-sm text-sm flex items-center gap-2"
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
          Recent Alerts
          {hasAlerts && (
            <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full px-2">
              {alerts.length}
            </span>
          )}
          {hasAlerts && <span className="ml-2 text-xs text-muted-foreground">{timeAgo(alerts[0].time)}</span>}
        </button>
      </div>
      {renderOverlay()}
    </>
  );
}

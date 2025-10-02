import React, { useEffect, useState, useRef } from 'react';
import FocusTrap from 'focus-trap-react';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(curr.slice(0,50))); 
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
    const curr = loadAlerts().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(curr));
    window.dispatchEvent(new Event('alerts-log-updated'));
  } catch {
    // localStorage update failed
  }
}

export default function AlertsActivityLog() {
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
        clearTimeout(undoTimer.current as any);
      }
    };
  }, []);

  // control opening flourish (slideIn) and remember previous active element for focus restore
  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    }
  }, [open]);

  function timeAgo(iso: string) {
    try {
      const then = new Date(iso).getTime();
      const diff = Date.now() - then;
      const s = Math.floor(diff / 1000);
      if (s < 60) return `${s}s ago`;
      const m = Math.floor(s / 60);
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      const d = Math.floor(h / 24);
      return `${d}d ago`;
    } catch { return new Date(iso).toLocaleString(); }
  }

  const hasAlerts = alerts.length > 0;

  return (
    <>
      <div>
        <button onClick={() => setOpen(true)} className="relative bg-white border rounded-md px-3 py-2 shadow-sm text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 2C13.1046 2 14 2.89543 14 4V5.178C16.39 6.006 18 8.388 18 11V16L20 18V19H4V18L6 16V11C6 8.388 7.61 6.006 10 5.178V4C10 2.89543 10.8954 2 12 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
          Recent Alerts
          {hasAlerts && <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full px-2">{alerts.length}</span>}
          {hasAlerts && <span className="ml-2 text-xs text-muted-foreground">{timeAgo(alerts[0].time)}</span>}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50" role="presentation">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <FocusTrap active={true} focusTrapOptions={{ clickOutsideDeactivates: true, escapeDeactivates: true, onDeactivate: () => setOpen(false) }}>
            <div
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              className={`absolute right-0 top-0 h-full w-full md:w-96 bg-card shadow-xl border-l p-4 overflow-auto transform transition-all duration-200 ${slideIn ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}`}
              style={{ transitionTimingFunction: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'linear' : undefined }}
            >
              {/* Hidden, tabbable anchor to satisfy focus-trap in jsdom tests */}
              <button id="__alerts-focus-anchor" tabIndex={0} onFocus={() => { /* no-op anchor for focus-trap */ }} style={{position: 'absolute', left: '-9999px', width: 1, height: 1, margin: 0, padding: 0, border: 0}} />
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Recent Alerts</h3>
                <div className="flex items-center space-x-2">
                  <button className="text-xs text-foreground/80 hover:underline mr-2" onClick={() => setShowingConfirm(true)} aria-haspopup="dialog">Clear all</button>
                  <button className="btn btn-sm" onClick={() => setOpen(false)}>Close</button>
                </div>
              </div>

              {showUndo && prevAlerts && (
                <div className="mb-2 p-2 bg-muted rounded flex items-center justify-between" role="status" aria-live="polite">
                  <div className="text-sm">Alerts cleared.</div>
                  <div>
                    <button onClick={() => {
                      // restore
                      try { 
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(prevAlerts)); 
                        window.dispatchEvent(new Event('alerts-log-updated')); 
                      } catch {
                        // Restore failed
                      }
                      setPrevAlerts(null); setShowUndo(false);
                      if (undoTimer.current) { clearTimeout(undoTimer.current as any); undoTimer.current = null; }
                    }} className="text-sm underline">Undo</button>
                  </div>
                </div>
              )}

              {showingConfirm && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 flex items-center justify-center bg-black/40">
                  <div className="bg-white p-4 rounded max-w-sm w-full">
                    <div className="font-medium mb-2">Confirm clear all alerts</div>
                    <div className="text-sm text-muted-foreground mb-4">This will remove all recent alerts. You can undo for a short time.</div>
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => setShowingConfirm(false)} className="px-3 py-1">Cancel</button>
                      <button onClick={() => {
                        // perform clear, keep copy for undo
                        const copy = loadAlerts();
                        setPrevAlerts(copy);
                        clearAlerts();
                        setShowingConfirm(false);
                        setShowUndo(true);
                        // announce and focus
                        setTimeout(() => {
                          statusRef.current?.focus();
                        }, 10);
                        if (undoTimer.current) clearTimeout(undoTimer.current as any);
                        undoTimer.current = window.setTimeout(() => { setShowUndo(false); setPrevAlerts(null); undoTimer.current = null; }, 6000);
                      }} className="px-3 py-1 bg-primary text-white">Yes, clear</button>
                    </div>
                  </div>
                </div>
              )}


              {!hasAlerts && (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-sm text-muted-foreground" tabIndex={-1} ref={statusRef}>No recent alerts</div>
                  <button
                    className="mt-2 px-3 py-1 rounded bg-muted text-foreground text-sm border"
                    onClick={() => setOpen(false)}
                    autoFocus
                  >
                    Close
                  </button>
                </div>
              )}

              {hasAlerts && (
                <ul className="text-sm space-y-2">
                  {alerts.map(a => (
                  <li key={a.id} className="border rounded p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{a.message}</div>
                        <div className="text-muted-foreground text-xs" aria-label={new Date(a.time).toLocaleString()}>{timeAgo(a.time)}</div>
                      </div>
                      <div className="ml-3 flex flex-col items-end">
                        <button onClick={() => {
                          // confirm acknowledge
                          try {
                            const ok = window.confirm?.('Acknowledge this alert?');
                            if (ok) acknowledgeAlert(a.id);
                          } catch { acknowledgeAlert(a.id); }
                        }} className="text-xs text-foreground/80 hover:underline">Acknowledge</button>
                      </div>
                    </div>
                  </li>
                  ))}
                </ul>
              )}
            </div>
          </FocusTrap>
        </div>
      )}
    </>
  );
}

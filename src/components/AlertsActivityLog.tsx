import React, { useEffect, useState, useRef } from 'react';

const STORAGE_KEY = 'pain-tracker:alerts-log';

export type AlertRecord = { id: string; time: string; message: string };

export function loadAlerts(): AlertRecord[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

export function saveAlert(rec: AlertRecord) {
  try { const curr = loadAlerts(); curr.unshift(rec); localStorage.setItem(STORAGE_KEY, JSON.stringify(curr.slice(0,50))); window.dispatchEvent(new Event('alerts-log-updated')); } catch {}
}

export function clearAlerts() {
  try { localStorage.removeItem(STORAGE_KEY); window.dispatchEvent(new Event('alerts-log-updated')); } catch {}
}

export function acknowledgeAlert(id: string) {
  try {
    const curr = loadAlerts().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(curr));
    window.dispatchEvent(new Event('alerts-log-updated'));
  } catch {}
}

export default function AlertsActivityLog() {
  const [alerts, setAlerts] = useState<AlertRecord[]>(() => loadAlerts());
  const [showingConfirm, setShowingConfirm] = useState(false);
  const [prevAlerts, setPrevAlerts] = useState<AlertRecord[] | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimer = useRef<number | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);

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
    <div className="p-3 bg-card border rounded max-h-64 overflow-auto">
      <h4 className="font-medium mb-2">Recent Alerts</h4>
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={() => setShowingConfirm(true)}
          className="text-xs text-foreground/80 hover:underline mr-2"
          aria-haspopup="dialog"
        >
          Clear all
        </button>
      </div>
      {showUndo && prevAlerts && (
        <div className="mb-2 p-2 bg-muted rounded flex items-center justify-between" role="status" aria-live="polite">
          <div className="text-sm">Alerts cleared.</div>
          <div>
            <button onClick={() => {
              // restore
              try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prevAlerts)); window.dispatchEvent(new Event('alerts-log-updated')); } catch {}
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
        <div className="text-sm text-muted-foreground" tabIndex={-1} ref={statusRef}>No recent alerts</div>
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
  );
}

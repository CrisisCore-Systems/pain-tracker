import React from 'react';

export function triggerQuickLog() {
  const ev = new CustomEvent('quick-log', { detail: { source: 'quick-actions', time: new Date().toISOString() } });
  window.dispatchEvent(ev);
}

export default function QuickActions() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="space-y-2">
        <button
          aria-label="Quick log pain"
          onClick={() => triggerQuickLog()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded shadow-md"
        >
          Quick Log
        </button>
        <button
          aria-label="Quick note"
          onClick={() => window.dispatchEvent(new CustomEvent('quick-note', { detail: { time: new Date().toISOString() } }))}
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded shadow-md"
        >
          Quick Note
        </button>
      </div>
    </div>
  );
}

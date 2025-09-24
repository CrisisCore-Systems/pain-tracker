import React, { useState } from 'react';
import { suggestTagsForText } from '../services/quickNoteTagger';

export function triggerQuickLog() {
  const ev = new CustomEvent('quick-log', { detail: { source: 'quick-actions', time: new Date().toISOString() } });
  window.dispatchEvent(ev);
}

export default function QuickActions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  function handleQuickNote() {
    const detail: any = { time: new Date().toISOString(), suggestedTags: [] };
    const sample = '';
    const tags = suggestTagsForText(sample);
    detail.suggestedTags = tags;
    window.dispatchEvent(new CustomEvent('quick-note', { detail } as any));
    setSuggestions(tags);
    setTimeout(() => setSuggestions([]), 6000);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end space-y-3">
        {/* Expanded actions */}
        {open && (
          <div className="flex flex-col items-end space-y-2">
            <button
              aria-label="Quick note"
              onClick={handleQuickNote}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-secondary-foreground shadow-md"
              title="Quick note"
            >
              📝
            </button>
            <button
              aria-label="Quick log pain"
              onClick={() => { triggerQuickLog(); setOpen(false); }}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-md"
              title="Quick log pain"
            >
              +
            </button>
          </div>
        )}

        {/* Main FAB */}
        <button
          aria-label="Open quick actions"
          onClick={() => setOpen(s => !s)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-foreground text-foreground-contrast shadow-lg"
        >
          {open ? '×' : '✚'}
        </button>

        {suggestions.length > 0 && (
          <div className="mt-2 bg-card border rounded p-2 text-sm shadow-md">
            Suggested tags: {suggestions.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

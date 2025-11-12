import React, { useState, useEffect, useCallback } from 'react';
// Mock implementation for quick note tagger
const suggestTagsForText = (text: string): string[] => {
  // Simple mock implementation
  if (text.includes('headache')) return ['head', 'migraine'];
  if (text.includes('back')) return ['back', 'spine'];
  return ['general'];
};

// import { suggestTagsForText } from '@pain-tracker/services/quickNoteTagger';

export function triggerQuickLog() {
  const ev = new CustomEvent('quick-log', { detail: { source: 'quick-actions', time: new Date().toISOString() } });
  window.dispatchEvent(ev);
}

export default function QuickActions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handleQuickNote = useCallback(() => {
    const detail: any = { time: new Date().toISOString(), suggestedTags: [] };
    const sample = '';
    const tags = suggestTagsForText(sample);
    detail.suggestedTags = tags;
    window.dispatchEvent(new CustomEvent('quick-note', { detail } as any));
    setSuggestions(tags);
    setTimeout(() => setSuggestions([]), 6000);
  }, []);

  const handleQuickLog = useCallback(() => {
    triggerQuickLog();
    setOpen(false);
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen(s => !s);
  }, []);

  // Keyboard shortcuts: Q to toggle, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not in an input field
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (e.key === 'q' && !isInputField && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleOpen();
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, toggleOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-[70]">
      <div className="flex flex-col items-end space-y-3">
        {/* Expanded actions */}
        {open && (
          <div className="flex flex-col items-end space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              aria-label="Quick note"
              onClick={handleQuickNote}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              title="Quick note"
            >
              📝
            </button>
            <button
              aria-label="Quick log pain"
              onClick={handleQuickLog}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              title="Quick log pain"
            >
              +
            </button>
          </div>
        )}

        {/* Main FAB */}
        <button
          aria-label={open ? "Close quick actions" : "Open quick actions (Ctrl+Q)"}
          onClick={toggleOpen}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-foreground text-foreground-contrast shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          title={open ? "Close (Esc)" : "Quick Actions (Ctrl+Q)"}
        >
          <span className="text-xl">{open ? '×' : '✚'}</span>
        </button>

        {/* Keyboard hint */}
        {!open && (
          <div className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Q</kbd>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-2 bg-card border rounded p-2 text-sm shadow-md animate-in fade-in slide-in-from-bottom-2 duration-200">
            Suggested tags: {suggestions.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

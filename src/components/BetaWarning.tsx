import React, { useEffect, useState, useCallback } from 'react';
import { secureStorage } from '../lib/storage/secureStorage';
import { BETA_WARNING, BETA_LOCALSTORAGE_KEY } from '../config/beta';

export default function BetaWarning() {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    try {
      const dismissed = secureStorage.get<string>(BETA_LOCALSTORAGE_KEY);
      setVisible(dismissed !== 'true');
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      secureStorage.set(BETA_LOCALSTORAGE_KEY, 'true');
    } catch {
      try {
        localStorage.setItem(BETA_LOCALSTORAGE_KEY, '1');
      } catch {
        // Ignore localStorage errors
      }
    }
    setVisible(false);
  }, []);

  // Keyboard shortcut: Escape to dismiss
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] max-w-3xl w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-yellow-50 border-2 border-yellow-300 text-yellow-900 rounded-lg p-4 shadow-lg flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-base">{BETA_WARNING.title}</h3>
          <p className="text-sm mt-1">{BETA_WARNING.message}</p>
          <a
            className="text-xs text-yellow-700 underline mt-2 inline-block hover:text-yellow-800"
            href={BETA_WARNING.supportUrl}
            target="_blank"
            rel="noreferrer"
          >
            Report an issue or give feedback
          </a>
          <div className="text-xs text-yellow-600 mt-2 opacity-70">
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-yellow-100 rounded border border-yellow-300">Esc</kbd>{' '}
            to dismiss
          </div>
        </div>
        <div className="ml-4 flex items-start gap-2">
          <button
            aria-label="Dismiss beta notice"
            onClick={dismiss}
            className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-100 transition-colors"
            title="Close (Esc)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <button
            aria-label="Dismiss and don't show again"
            onClick={dismiss}
            className="text-sm bg-yellow-600 text-white px-3 py-1.5 rounded-md hover:bg-yellow-700 transition-colors shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

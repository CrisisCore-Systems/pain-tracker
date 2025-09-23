import React, { useEffect, useState } from 'react';
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

  const dismiss = () => {
    try {
      secureStorage.set(BETA_LOCALSTORAGE_KEY, 'true');
    } catch {
      try { localStorage.setItem(BETA_LOCALSTORAGE_KEY, '1'); } catch {}
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-3xl w-full px-4">
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg p-4 shadow-md flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{BETA_WARNING.title}</h3>
          <p className="text-sm mt-1">{BETA_WARNING.message}</p>
          <a className="text-xs text-yellow-700 underline mt-2 inline-block" href={BETA_WARNING.supportUrl} target="_blank" rel="noreferrer">
            Report an issue or give feedback
          </a>
        </div>
        <div className="ml-4 flex items-start">
          <button
            aria-label="Dismiss beta notice"
            onClick={dismiss}
            className="text-sm bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

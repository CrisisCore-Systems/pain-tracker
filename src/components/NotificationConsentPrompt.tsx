import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'pain-tracker:notification-consent';

export default function NotificationConsentPrompt() {
  const [consent, setConsent] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });

  useEffect(() => {
    // if already set, nothing to do
  }, [consent]);

  async function grant() {
    try {
      const p = await Notification.requestPermission();
      localStorage.setItem(STORAGE_KEY, p);
      setConsent(p);
    } catch (e) {
      localStorage.setItem(STORAGE_KEY, 'denied');
      setConsent('denied');
    }
  }

  function dismiss() {
    // store 'dismissed' so we don't pester
    localStorage.setItem(STORAGE_KEY, 'dismissed');
    setConsent('dismissed');
  }

  if (consent) return null;

  return (
    <div className="fixed bottom-4 left-4 z-60 p-4 bg-card border rounded shadow-md max-w-sm">
      <div className="mb-2 font-medium">Get gentle notifications?</div>
      <div className="text-sm text-muted-foreground mb-3">We can notify you about important pain pattern alerts and medication reminders. You can change this later in Settings.</div>
      <div className="flex gap-2">
        <button onClick={grant} className="btn btn-primary">Allow</button>
        <button onClick={dismiss} className="btn">Not now</button>
      </div>
    </div>
  );
}

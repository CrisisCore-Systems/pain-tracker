import { useEffect, useState, useCallback } from 'react';
import { useToast } from './feedback';
import { useStartupPrompts } from '../contexts/StartupPromptsContext';

const STORAGE_KEY = 'pain-tracker:notification-consent';

export default function NotificationConsentPrompt() {
  const [consent, setConsent] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });
  const { bottomLeft } = useToast();
  const { requestPrompt, dismissPrompt, canShowPrompt } = useStartupPrompts();

  const grant = useCallback(async () => {
    try {
      const p = await Notification.requestPermission();
      localStorage.setItem(STORAGE_KEY, p);
      setConsent(p);
      dismissPrompt('notification-consent');
    } catch {
      localStorage.setItem(STORAGE_KEY, 'denied');
      setConsent('denied');
      dismissPrompt('notification-consent');
    }
  }, [dismissPrompt]);

  useEffect(() => {
    if (!consent) {
      // Request to show this prompt with priority 2 (after beta warning)
      requestPrompt('notification-consent', 2);
    }
  }, [consent, requestPrompt]);

  useEffect(() => {
    if (!consent && canShowPrompt('notification-consent')) {
      // Show notification permission prompt as a bottom-left toast
      bottomLeft.info(
        'Get gentle notifications?',
        'We can notify you about important pain pattern alerts and medication reminders. You can change this later in Settings.',
        {
          label: 'Allow',
          onClick: grant
        },
        {
          onDismiss: () => {
            // When dismissed (X clicked), store 'dismissed'
            localStorage.setItem(STORAGE_KEY, 'dismissed');
            setConsent('dismissed');
            dismissPrompt('notification-consent');
          }
        }
      );
    }
  }, [consent, bottomLeft, canShowPrompt, dismissPrompt, grant]);

  // Don't render anything - the toast handles the UI
  return null;
}

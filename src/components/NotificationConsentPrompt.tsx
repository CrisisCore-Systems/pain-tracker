import { useEffect, useState } from 'react';
import { useToast } from './feedback';

const STORAGE_KEY = 'pain-tracker:notification-consent';

export default function NotificationConsentPrompt() {
  const [consent, setConsent] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const { bottomLeft } = useToast();

  useEffect(() => {
    if (!consent) {
      // Show notification permission prompt as a bottom-left toast
      bottomLeft.info(
        'Get gentle notifications?',
        'We can notify you about important pain pattern alerts and medication reminders. You can change this later in Settings.',
        {
          label: 'Allow',
          onClick: grant,
        },
        {
          onDismiss: () => {
            // When dismissed (X clicked), store 'dismissed'
            localStorage.setItem(STORAGE_KEY, 'dismissed');
            setConsent('dismissed');
          },
        }
      );
    }
  }, [consent, bottomLeft]);

  async function grant() {
    try {
      const p = await Notification.requestPermission();
      localStorage.setItem(STORAGE_KEY, p);
      setConsent(p);
    } catch {
      localStorage.setItem(STORAGE_KEY, 'denied');
      setConsent('denied');
    }
  }

  // Don't render anything - the toast handles the UI
  return null;
}

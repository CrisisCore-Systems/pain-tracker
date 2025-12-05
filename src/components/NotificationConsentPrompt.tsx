import { useEffect, useState, useRef } from 'react';
import { useToast } from './feedback';
import { useStartupPrompts } from '../contexts/StartupPromptsContext';

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
  const { requestPrompt, dismissPrompt, canShowPrompt } = useStartupPrompts();
  // Track whether we've already shown the toast to prevent duplicate toasts
  const hasShownToast = useRef(false);
  // Use refs to avoid dependency changes causing infinite re-renders
  const dismissPromptRef = useRef(dismissPrompt);

  // Keep refs up to date with latest values
  useEffect(() => {
    dismissPromptRef.current = dismissPrompt;
  }, [dismissPrompt]);

  useEffect(() => {
    if (!consent) {
      // Request to show this prompt with priority 2 (after beta warning)
      requestPrompt('notification-consent', 2);
    }
  }, [consent, requestPrompt]);

  useEffect(() => {
    // Check localStorage directly to avoid race conditions with React state
    const storedConsent = localStorage.getItem(STORAGE_KEY);
    if (storedConsent) {
      // Already have consent stored, don't show toast
      return;
    }
    
    // Only show toast once per session to prevent infinite re-renders
    if (!consent && canShowPrompt('notification-consent') && !hasShownToast.current) {
      hasShownToast.current = true;

      const handleGrant = async () => {
        try {
          const p = await Notification.requestPermission();
          localStorage.setItem(STORAGE_KEY, p);
          setConsent(p);
          dismissPromptRef.current('notification-consent');
        } catch {
          localStorage.setItem(STORAGE_KEY, 'denied');
          setConsent('denied');
          dismissPromptRef.current('notification-consent');
        }
      };

      const handleDismiss = () => {
        // When dismissed (X clicked), store 'dismissed'
        localStorage.setItem(STORAGE_KEY, 'dismissed');
        setConsent('dismissed');
        dismissPromptRef.current('notification-consent');
      };

      // Show notification permission prompt as a bottom-left toast
      bottomLeft.info(
        'Get gentle notifications?',
        'We can notify you about important pain pattern alerts and medication reminders. You can change this later in Settings.',
        {
          label: 'Allow',
          onClick: handleGrant,
        },
        {
          onDismiss: handleDismiss
        }
      );
    }
    // Note: bottomLeft is intentionally omitted from deps - using it would cause infinite re-renders
    // because useToast returns a new object on each render. We use bottomLeft inside the effect
    // but guard against re-execution with hasShownToast ref and localStorage check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consent, canShowPrompt]);

  // Don't render anything - the toast handles the UI
  return null;
}

import { useEffect, useState, useRef } from 'react';
import { useToast } from './feedback';
import { privacyAnalytics } from '../services/PrivacyAnalyticsService';
import { useStartupPrompts } from '../contexts/StartupPromptsContext';

const STORAGE_KEY = 'pain-tracker:analytics-consent';

export default function BetaAnalyticsConsentPrompt() {
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
  const bottomLeftRef = useRef(bottomLeft);
  const dismissPromptRef = useRef(dismissPrompt);

  // Keep refs up to date with latest values
  useEffect(() => {
    bottomLeftRef.current = bottomLeft;
    dismissPromptRef.current = dismissPrompt;
  }, [bottomLeft, dismissPrompt]);

  useEffect(() => {
    if (!consent) {
      // Request to show this prompt with priority 3 (after notification consent)
      requestPrompt('analytics-consent', 3);
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
    if (!consent && canShowPrompt('analytics-consent') && !hasShownToast.current) {
      hasShownToast.current = true;

      const handleGrant = async () => {
        try {
          localStorage.setItem(STORAGE_KEY, 'granted');
          setConsent('granted');

          // Enable analytics in the service
          const consentGranted = await privacyAnalytics.requestConsent();

          if (consentGranted) {
            bottomLeftRef.current.success(
              'Thank you!',
              'Your anonymous usage data will help us improve Pain Tracker for everyone.'
            );
          }
          
          dismissPromptRef.current('analytics-consent');
        } catch {
          localStorage.setItem(STORAGE_KEY, 'error');
          setConsent('error');
          dismissPromptRef.current('analytics-consent');
        }
      };

      const handleDismiss = () => {
        // When dismissed (X clicked), store 'declined'
        localStorage.setItem(STORAGE_KEY, 'declined');
        setConsent('declined');
        privacyAnalytics.updatePrivacyConfig({ enableAnalytics: false });
        dismissPromptRef.current('analytics-consent');
      };

      // Show analytics consent prompt as a bottom-left toast
      bottomLeftRef.current.info(
        'Help improve Pain Tracker?',
        'We\'d like to collect anonymous usage data to improve the app. Your pain data stays private and local. No personal information is collected.',
        {
          label: 'Allow',
          onClick: handleGrant
        },
        {
          onDismiss: handleDismiss
        }
      );
    }
    // Note: bottomLeftRef.current is intentionally used instead of adding bottomLeft to deps.
    // useToast returns a new object on each render which would cause infinite re-renders.
    // We use refs and guard against re-execution with hasShownToast ref and localStorage check.
     
  }, [consent, canShowPrompt]);

  // Don't render anything - the toast handles the UI
  return null;
}

import { useEffect, useState, useCallback } from 'react';
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

  const grant = useCallback(async () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'granted');
      setConsent('granted');

      // Enable analytics in the service
      const consentGranted = await privacyAnalytics.requestConsent();

      if (consentGranted) {
        bottomLeft.success(
          'Thank you!',
          'Your anonymous usage data will help us improve Pain Tracker for everyone.'
        );
      }
      
      dismissPrompt('analytics-consent');
    } catch {
      localStorage.setItem(STORAGE_KEY, 'error');
      setConsent('error');
      dismissPrompt('analytics-consent');
    }
  }, [bottomLeft, dismissPrompt]);

  useEffect(() => {
    if (!consent) {
      // Request to show this prompt with priority 3 (after notification consent)
      requestPrompt('analytics-consent', 3);
    }
  }, [consent, requestPrompt]);

  useEffect(() => {
    if (!consent && canShowPrompt('analytics-consent')) {
      // Show analytics consent prompt as a bottom-left toast
      bottomLeft.info(
        'Help improve Pain Tracker?',
        'We\'d like to collect anonymous usage data to improve the app. Your pain data stays private and local. No personal information is collected.',
        {
          label: 'Allow',
          onClick: grant
        },
        {
          onDismiss: () => {
            // When dismissed (X clicked), store 'declined'
            localStorage.setItem(STORAGE_KEY, 'declined');
            setConsent('declined');
            privacyAnalytics.updatePrivacyConfig({ enableAnalytics: false });
            dismissPrompt('analytics-consent');
          }
        }
      );
    }
  }, [consent, bottomLeft, canShowPrompt, dismissPrompt, grant]);

  // Don't render anything - the toast handles the UI
  return null;
}

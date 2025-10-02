import { useEffect, useState } from 'react';
import { useToast } from './feedback';
import { privacyAnalytics } from '../services/PrivacyAnalyticsService';

const STORAGE_KEY = 'pain-tracker:analytics-consent';

export default function BetaAnalyticsConsentPrompt() {
  const [consent, setConsent] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });
  const { bottomLeft } = useToast();

  const grant = async () => {
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
    } catch {
      localStorage.setItem(STORAGE_KEY, 'error');
      setConsent('error');
    }
  };

  useEffect(() => {
    if (!consent) {
      // Show analytics consent prompt as a bottom-left toast
      // Delay slightly to avoid overlapping with other prompts
      const timer = setTimeout(() => {
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
            }
          }
        );
      }, 2000); // 2 second delay to avoid prompt collision

      return () => clearTimeout(timer);
    }
  }, [consent, bottomLeft, grant]);

  // Don't render anything - the toast handles the UI
  return null;
}

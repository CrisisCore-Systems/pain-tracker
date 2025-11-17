import React, { createContext, useState, useCallback } from 'react';

interface EmpathyConsentState {
  consentGranted: boolean;
  privacyLevel: 'personal' | 'family' | 'healthcare_team' | 'community';
  grantConsent: () => void;
  revokeConsent: () => void;
  setPrivacyLevel: (level: EmpathyConsentState['privacyLevel']) => void;
}

const EmpathyConsentContext = createContext<EmpathyConsentState | undefined>(undefined);

export const EmpathyConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consentGranted, setConsentGranted] = useState(false);
  const [privacyLevel, setPrivacyLevelState] =
    useState<EmpathyConsentState['privacyLevel']>('personal');

  const grantConsent = useCallback(() => setConsentGranted(true), []);
  const revokeConsent = useCallback(() => setConsentGranted(false), []);
  const setPrivacyLevel = useCallback(
    (level: EmpathyConsentState['privacyLevel']) => setPrivacyLevelState(level),
    []
  );

  return (
    <EmpathyConsentContext.Provider
      value={{ consentGranted, privacyLevel, grantConsent, revokeConsent, setPrivacyLevel }}
    >
      {children}
    </EmpathyConsentContext.Provider>
  );
};

export { EmpathyConsentContext };

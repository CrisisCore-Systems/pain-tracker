import { useContext } from 'react';
import { EmpathyConsentContext } from '../context/EmpathyConsentContext';

export function useEmpathyConsent() {
  const ctx = useContext(EmpathyConsentContext);
  if (!ctx) throw new Error('useEmpathyConsent must be used within EmpathyConsentProvider');
  return ctx;
}

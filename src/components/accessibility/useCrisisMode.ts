/**
 * Crisis Mode Hook
 * Custom hook for accessing crisis mode context
 */

import { useContext } from 'react';
import { CrisisModeContext, CrisisModeContextType } from './CrisisModeContext.js';

export function useCrisisMode(): CrisisModeContextType {
  const context = useContext(CrisisModeContext);
  if (!context) {
    throw new Error('useCrisisMode must be used within a CrisisModeProvider');
  }
  return context;
}

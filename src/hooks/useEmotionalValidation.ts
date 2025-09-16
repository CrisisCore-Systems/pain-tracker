/**
 * Hook for using emotional validation
 * Separated for Fast Refresh compatibility
 */

import { useState, useCallback } from 'react';
import type { ValidationResponse } from '../services/EmotionalValidationService';

export function useEmotionalValidation() {
  const [validationHistory, setValidationHistory] = useState<ValidationResponse[]>([]);
  
  const addValidation = useCallback((validation: ValidationResponse) => {
    setValidationHistory(prev => [...prev, validation].slice(-10)); // Keep last 10
  }, []);
  
  const clearHistory = useCallback(() => {
    setValidationHistory([]);
  }, []);
  
  return {
    validationHistory,
    addValidation,
    clearHistory
  };
}

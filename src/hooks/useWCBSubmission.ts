import { useState, useEffect, useCallback } from 'react';
import { 
  submitToWCB, 
  getQueuedSubmissions, 
  processQueuedSubmissions, 
  getCircuitBreakerStatus,
  type QueuedSubmission 
} from '../services/wcb-submission';
import type { WCBReport } from '../types';

interface SubmissionState {
  isSubmitting: boolean;
  lastSubmission: {
    success: boolean;
    submissionId?: string;
    error?: string;
    validationErrors?: Array<{ field: string; message: string }>;
  } | null;
  queue: QueuedSubmission[];
  circuitBreaker: {
    state: 'closed' | 'open' | 'half-open';
    failures: number;
    nextRetryAt: number | null;
  };
}

export function useWCBSubmission() {
  const [state, setState] = useState<SubmissionState>({
    isSubmitting: false,
    lastSubmission: null,
    queue: [],
    circuitBreaker: {
      state: 'closed',
      failures: 0,
      nextRetryAt: null
    }
  });

  // Update queue and circuit breaker status
  const updateStatus = useCallback(() => {
    const queue = getQueuedSubmissions();
    const circuitBreaker = getCircuitBreakerStatus();
    
    setState(prev => ({
      ...prev,
      queue,
      circuitBreaker
    }));
  }, []);

  // Process queued submissions periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      await processQueuedSubmissions();
      updateStatus();
    }, 30000); // Every 30 seconds

    // Initial update
    updateStatus();

    return () => clearInterval(interval);
  }, [updateStatus]);

  const submit = useCallback(async (
    report: WCBReport,
    isDraft: boolean = false
  ) => {
    setState(prev => ({ ...prev, isSubmitting: true, lastSubmission: null }));

    try {
      const result = await submitToWCB(report, { isDraft });
      
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        lastSubmission: result
      }));

      // Update status after submission
      updateStatus();

      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        lastSubmission: errorResult
      }));

      return errorResult;
    }
  }, [updateStatus]);

  const retryQueuedSubmissions = useCallback(async () => {
    await processQueuedSubmissions();
    updateStatus();
  }, [updateStatus]);

  const clearLastSubmission = useCallback(() => {
    setState(prev => ({ ...prev, lastSubmission: null }));
  }, []);

  return {
    submit,
    retryQueuedSubmissions,
    clearLastSubmission,
    updateStatus,
    ...state
  };
}
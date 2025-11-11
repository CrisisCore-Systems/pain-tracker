import React from 'react';
import { PainEntryForm } from './PainEntryForm';
import { useSubscriptionEntry } from '../../hooks/useSubscriptionEntry';
import { UsageWarning } from '../subscription/FeatureGates';
import type { PainEntry } from '../../types';

interface SubscriptionAwarePainEntryFormProps {
  userId: string;
}

/**
 * PainEntryForm with Subscription Integration
 * 
 * Wraps the original PainEntryForm with:
 * - Quota enforcement before entry creation
 * - Usage tracking after successful submissions
 * - Usage warnings when approaching limits
 * - User-friendly error messages for quota violations
 */
export function SubscriptionAwarePainEntryForm({ userId }: SubscriptionAwarePainEntryFormProps) {
  const { 
    addPainEntry, 
    isQuotaExceeded, 
    quotaMessage, 
    isLoading 
  } = useSubscriptionEntry(userId);

  const handleSubmit = async (entry: Omit<PainEntry, 'id' | 'timestamp'>) => {
    try {
      await addPainEntry(entry);
      // Success! The hook handles state reset internally
    } catch (error) {
      // Error is already captured in quotaMessage state
      console.error('Failed to add pain entry:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Usage warning appears when approaching quota limit */}
      <UsageWarning feature="maxPainEntries" threshold={80} />
      
      {/* Quota exceeded error message */}
      {isQuotaExceeded && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 text-red-600 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                Entry Limit Reached
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                {quotaMessage}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                Upgrade your plan to continue tracking your pain without limits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Checking quota...</span>
            </div>
          </div>
        </div>
      )}

      {/* Original form */}
      <PainEntryForm onSubmit={handleSubmit} />
    </div>
  );
}

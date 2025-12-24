import { useState } from 'react';
import { usePainTrackerStore } from '../stores/pain-tracker-store';
import {
  checkPainEntryQuota,
  trackPainEntryUsage,
  checkMoodEntryQuota,
  trackMoodEntryUsage,
  checkActivityLogQuota,
  trackActivityLogUsage,
} from '../stores/subscription-actions';
import type { PainEntry, ActivityLogEntry } from '../types';
import type { MoodEntry } from '../types/quantified-empathy';
import { maybeCaptureWeatherForNewEntry } from '../services/weatherAutoCapture';
import { 
  trackPainEntry, 
  trackWeatherCorrelation, 
  trackMoodEntry,
  trackActivityLog,
  type PainEntryAnalytics,
  type WeatherAnalytics,
  type MoodAnalytics,
  type ActivityAnalytics,
} from '../services/AnalyticsTrackingService';

interface UseSubscriptionEntryResult {
  addPainEntry: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => Promise<void>;
  addMoodEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => Promise<void>;
  addActivityLog: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => Promise<void>;
  isQuotaExceeded: boolean;
  quotaMessage: string;
  isLoading: boolean;
}

/**
 * Hook for subscription-aware entry creation
 * Handles quota checks, usage tracking, and user feedback
 *
 * @param userId - Current user ID
 * @returns Methods for adding entries with quota enforcement
 *
 * @example
 * ```tsx
 * const { addPainEntry, isQuotaExceeded, quotaMessage } = useSubscriptionEntry(userId);
 *
 * const handleSubmit = async (data) => {
 *   try {
 *     await addPainEntry(data);
 *     // Success!
 *   } catch (error) {
 *     // Handle error (quota exceeded or other failure)
 *     console.error(error);
 *   }
 * };
 * ```
 */
export function useSubscriptionEntry(userId: string): UseSubscriptionEntryResult {
  const store = usePainTrackerStore();
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addPainEntry = async (entry: Omit<PainEntry, 'id' | 'timestamp'>) => {
    setIsLoading(true);
    try {
      // Check quota before adding
      const quotaCheck = await checkPainEntryQuota(userId);

      if (!quotaCheck.success) {
        setIsQuotaExceeded(true);
        setQuotaMessage(quotaCheck.error || 'Pain entry quota exceeded. Please upgrade your plan.');
        throw new Error(quotaCheck.error || 'Quota exceeded');
      }

      // Try to enrich the entry with local weather when possible. This is
      // best-effort only and must never block the user from saving an entry.
      const capturedWeather = await maybeCaptureWeatherForNewEntry();
      if (capturedWeather) {
        entry.weather = capturedWeather.summary;
      }

      // Add entry using store action
      store.addEntry(entry);

      // Track usage asynchronously (don't await)
      void trackPainEntryUsage(userId);

      // Track analytics for pain entry (privacy-safe)
      const weatherSummary = (entry as Record<string, unknown>).weather as string | undefined;
      const painLevel = entry.baselineData?.pain ?? 0;
      const painAnalytics: PainEntryAnalytics = {
        painLevel,
        symptoms: entry.baselineData?.symptoms,
        triggers: entry.triggers,
        weather: weatherSummary,
        severity: painLevel >= 7 ? 'severe' : painLevel >= 4 ? 'moderate' : 'mild',
      };
      trackPainEntry(painAnalytics);

      // Track weather correlation with full weather data if available
      if (capturedWeather) {
        const weatherAnalytics: WeatherAnalytics = {
          temperature: capturedWeather.weather.temperature ?? undefined,
          condition: capturedWeather.weather.condition ?? undefined,
          pressure: capturedWeather.weather.pressure ?? undefined,
          humidity: capturedWeather.weather.humidity ?? undefined,
          painLevel,
        };
        trackWeatherCorrelation(weatherAnalytics);
      }

      // Reset quota exceeded state on success
      setIsQuotaExceeded(false);
      setQuotaMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const addMoodEntry = async (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => {
    setIsLoading(true);
    try {
      // Check quota before adding
      const quotaCheck = await checkMoodEntryQuota(userId);

      if (!quotaCheck.success) {
        setIsQuotaExceeded(true);
        setQuotaMessage(quotaCheck.error || 'Mood entry quota exceeded. Please upgrade your plan.');
        throw new Error(quotaCheck.error || 'Quota exceeded');
      }

      // Add entry using store action
  // Note: Need to ensure entry matches MoodEntry structure (no id, timestamp)
  const moodEntry = entry as unknown as Omit<MoodEntry, 'id' | 'timestamp'>;
  store.addMoodEntry(moodEntry);

      // Track usage asynchronously
      void trackMoodEntryUsage(userId);

      // Track mood analytics (privacy-safe)
      const moodAnalytics: MoodAnalytics = {
        moodScore: (entry as Record<string, unknown>).moodScore as number ?? 5,
        energyLevel: (entry as Record<string, unknown>).energyLevel as number,
        stressLevel: (entry as Record<string, unknown>).stressLevel as number,
      };
      trackMoodEntry(moodAnalytics);

      setIsQuotaExceeded(false);
      setQuotaMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const addActivityLog = async (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    setIsLoading(true);
    try {
      // Check quota before adding
      const quotaCheck = await checkActivityLogQuota(userId);

      if (!quotaCheck.success) {
        setIsQuotaExceeded(true);
        setQuotaMessage(
          quotaCheck.error || 'Activity log quota exceeded. Please upgrade your plan.'
        );
        throw new Error(quotaCheck.error || 'Quota exceeded');
      }

      // Add entry using store action
      store.addActivityLog(entry);

      // Track usage asynchronously
      void trackActivityLogUsage(userId);

      // Track activity analytics (privacy-safe)
      const activityAnalytics: ActivityAnalytics = {
        activityType: (entry as Record<string, unknown>).activityType as string ?? 'general',
        durationMinutes: (entry as Record<string, unknown>).duration as number ?? 0,
      };
      trackActivityLog(activityAnalytics);

      setIsQuotaExceeded(false);
      setQuotaMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addPainEntry,
    addMoodEntry,
    addActivityLog,
    isQuotaExceeded,
    quotaMessage,
    isLoading,
  };
}

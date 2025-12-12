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
// Attempt to enrich entries with local weather when available. This calls into
// the packaged service which falls back to a safe stub in environments where
// geolocation or network access is not available.
import { fetchLocalWeather } from '../../packages/services/src/weather';
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
      let weatherInfo: Awaited<ReturnType<typeof fetchLocalWeather>> | null = null;
      try {
        // Prefer to use browser geolocation when available to fetch local weather
        if (typeof navigator !== 'undefined' && 'geolocation' in navigator && navigator.geolocation) {
          // Small timeout to avoid blocking UI
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }) 
          );
          weatherInfo = await fetchLocalWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        } else {
          weatherInfo = await fetchLocalWeather();
        }

        if (weatherInfo && (weatherInfo.temp !== null || weatherInfo.condition !== null)) {
          // Build a rich human-readable summary including rain status
          const parts: string[] = [];
          if (weatherInfo.temp !== null) parts.push(`${Math.round(weatherInfo.temp)}°C`);
          if (weatherInfo.condition) parts.push(weatherInfo.condition);
          if (weatherInfo.isRaining) parts.push('🌧️');
          if (weatherInfo.humidity !== null) parts.push(`${weatherInfo.humidity}% humidity`);
          
          const summary = parts.join(', ') || undefined;
          if (summary) {
            // Attach as a best-effort field - cast to any to avoid strict type errors
            (entry as any).weather = summary;
          }
        }
      } catch (err) {
        // Ignore enrichment failures; entry save must not be blocked
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
      if (weatherInfo && (weatherInfo.temp !== null || weatherInfo.condition !== null)) {
        const weatherAnalytics: WeatherAnalytics = {
          temperature: weatherInfo.temp ?? undefined,
          condition: weatherInfo.condition ?? undefined,
          pressure: weatherInfo.pressure ?? undefined,
          humidity: weatherInfo.humidity ?? undefined,
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

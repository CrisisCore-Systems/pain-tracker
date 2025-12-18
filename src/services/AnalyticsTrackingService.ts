/**
 * Analytics Tracking Service
 * 
 * Centralizes all analytics event tracking for Pain Tracker.
 * Sends privacy-respecting aggregate data to Google Analytics.
 * 
 * IMPORTANT: No PHI (Protected Health Information) is ever sent.
 * Only anonymized, aggregate metrics for product improvement.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[];
  }
}

// Check if analytics is available
function isAnalyticsEnabled(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

// Safe gtag wrapper
function trackEvent(
  eventName: string,
  params: Record<string, string | number | boolean | undefined>
): void {
  if (!isAnalyticsEnabled()) return;
  
  try {
    // Filter out undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    );
    
    window.gtag?.('event', eventName, cleanParams);
  } catch (e) {
    console.debug('[Analytics] Event tracking failed:', e);
  }
}

// ============================================
// PAIN ENTRY TRACKING
// ============================================

export interface PainEntryAnalytics {
  painLevel: number;
  locationsCount?: number;
  symptomsCount?: number;
  triggersCount?: number;
  symptoms?: string[];
  triggers?: string[];
  hasNotes?: boolean;
  hasMedications?: boolean;
  weather?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek?: string;
  entryMethod?: 'quick' | 'detailed' | 'voice';
}

export function trackPainEntry(data: PainEntryAnalytics): void {
  // Calculate derived values
  const locationsCount = data.locationsCount ?? 0;
  const symptomsCount = data.symptomsCount ?? (data.symptoms?.length ?? 0);
  const triggersCount = data.triggersCount ?? (data.triggers?.length ?? 0);
  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = data.timeOfDay ?? (
    hour < 6 ? 'night' : 
    hour < 12 ? 'morning' : 
    hour < 18 ? 'afternoon' : 
    hour < 22 ? 'evening' : 'night'
  );
  const dayOfWeek = data.dayOfWeek ?? now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  trackEvent('pain_entry_logged', {
    pain_level_bucket: getPainBucket(data.painLevel),
    severity: data.severity ?? getPainBucket(data.painLevel),
    locations_count: Math.min(locationsCount, 10),
    symptoms_count: Math.min(symptomsCount, 10),
    triggers_count: Math.min(triggersCount, 10),
    has_notes: data.hasNotes ?? false,
    has_medications: data.hasMedications ?? false,
    has_weather: !!data.weather,
    time_of_day: timeOfDay,
    day_of_week: dayOfWeek,
    entry_method: data.entryMethod ?? 'detailed',
  });
}

function getPainBucket(level: number): string {
  if (level <= 2) return 'mild';
  if (level <= 5) return 'moderate';
  if (level <= 8) return 'severe';
  return 'extreme';
}

// ============================================
// WEATHER CORRELATION TRACKING
// ============================================

export interface WeatherAnalytics {
  temperature?: number;
  condition?: string;
  pressure?: number;
  humidity?: number;
  painLevel: number;
}

export function trackWeatherCorrelation(data: WeatherAnalytics): void {
  trackEvent('weather_correlation', {
    temp_bucket: data.temperature !== undefined ? getTempBucket(data.temperature) : undefined,
    condition: data.condition,
    pressure_bucket: data.pressure !== undefined ? getPressureBucket(data.pressure) : undefined,
    humidity_bucket: data.humidity !== undefined ? getHumidityBucket(data.humidity) : undefined,
    pain_level_bucket: getPainBucket(data.painLevel),
  });
}

function getTempBucket(temp: number): string {
  if (temp < 0) return 'freezing';
  if (temp < 10) return 'cold';
  if (temp < 20) return 'mild';
  if (temp < 30) return 'warm';
  return 'hot';
}

function getPressureBucket(pressure: number): string {
  if (pressure < 1000) return 'low';
  if (pressure < 1020) return 'normal';
  return 'high';
}

function getHumidityBucket(humidity: number): string {
  if (humidity < 30) return 'dry';
  if (humidity < 60) return 'comfortable';
  return 'humid';
}

// ============================================
// MOOD & QUALITY OF LIFE TRACKING
// ============================================

export interface MoodAnalytics {
  moodScore: number;
  sleepQuality?: number;
  stressLevel?: number;
  energyLevel?: number;
}

export function trackMoodEntry(data: MoodAnalytics): void {
  trackEvent('mood_entry_logged', {
    mood_bucket: getMoodBucket(data.moodScore),
    sleep_bucket: data.sleepQuality !== undefined ? getQualityBucket(data.sleepQuality) : undefined,
    stress_bucket: data.stressLevel !== undefined ? getStressBucket(data.stressLevel) : undefined,
    energy_bucket: data.energyLevel !== undefined ? getQualityBucket(data.energyLevel) : undefined,
  });
}

function getMoodBucket(score: number): string {
  if (score <= 2) return 'very_low';
  if (score <= 4) return 'low';
  if (score <= 6) return 'neutral';
  if (score <= 8) return 'good';
  return 'excellent';
}

function getQualityBucket(score: number): string {
  if (score <= 3) return 'poor';
  if (score <= 5) return 'fair';
  if (score <= 7) return 'good';
  return 'excellent';
}

function getStressBucket(score: number): string {
  if (score <= 2) return 'low';
  if (score <= 5) return 'moderate';
  if (score <= 8) return 'high';
  return 'severe';
}

// ============================================
// ACTIVITY & EXERCISE TRACKING
// ============================================

export interface ActivityAnalytics {
  activityType: string;
  durationMinutes: number;
  intensityLevel?: number;
  painBefore?: number;
  painAfter?: number;
}

export function trackActivityLog(data: ActivityAnalytics): void {
  trackEvent('activity_logged', {
    activity_type: data.activityType,
    duration_bucket: getDurationBucket(data.durationMinutes),
    intensity_bucket: data.intensityLevel !== undefined ? getIntensityBucket(data.intensityLevel) : undefined,
    pain_change: data.painBefore !== undefined && data.painAfter !== undefined
      ? getPainChange(data.painBefore, data.painAfter)
      : undefined,
  });
}

function getDurationBucket(minutes: number): string {
  if (minutes < 15) return 'brief';
  if (minutes < 30) return 'short';
  if (minutes < 60) return 'moderate';
  return 'extended';
}

function getIntensityBucket(level: number): string {
  if (level <= 3) return 'light';
  if (level <= 6) return 'moderate';
  return 'intense';
}

function getPainChange(before: number, after: number): string {
  const diff = after - before;
  if (diff <= -2) return 'improved_significantly';
  if (diff < 0) return 'improved';
  if (diff === 0) return 'unchanged';
  if (diff <= 2) return 'worsened';
  return 'worsened_significantly';
}

// ============================================
// MEDICATION TRACKING
// ============================================

export interface MedicationAnalytics {
  medicationType?: string;
  effectiveness?: number;
  sideEffects: boolean;
}

export function trackMedicationLog(data: MedicationAnalytics): void {
  trackEvent('medication_logged', {
    medication_category: data.medicationType || 'unspecified',
    effectiveness_bucket: data.effectiveness !== undefined 
      ? getEffectivenessBucket(data.effectiveness) 
      : undefined,
    has_side_effects: data.sideEffects,
  });
}

function getEffectivenessBucket(score: number): string {
  if (score <= 2) return 'not_effective';
  if (score <= 5) return 'somewhat_effective';
  if (score <= 8) return 'effective';
  return 'very_effective';
}

// ============================================
// TRIGGER ANALYSIS TRACKING
// ============================================

export interface TriggerAnalytics {
  triggerCategory: string;
  frequency: number;
  averagePainIncrease: number;
}

export function trackTriggerIdentified(data: TriggerAnalytics): void {
  trackEvent('trigger_identified', {
    trigger_category: data.triggerCategory,
    frequency_bucket: getFrequencyBucket(data.frequency),
    pain_impact: getPainImpactBucket(data.averagePainIncrease),
  });
}

function getFrequencyBucket(count: number): string {
  if (count <= 2) return 'rare';
  if (count <= 5) return 'occasional';
  if (count <= 10) return 'frequent';
  return 'very_frequent';
}

function getPainImpactBucket(increase: number): string {
  if (increase <= 1) return 'minimal';
  if (increase <= 2) return 'moderate';
  if (increase <= 3) return 'significant';
  return 'severe';
}

// ============================================
// PATTERN DETECTION TRACKING
// ============================================

export interface PatternAnalytics {
  patternType: 'time_of_day' | 'day_of_week' | 'weather' | 'activity' | 'medication' | 'sleep';
  confidence: number;
  correlationStrength: number;
}

export function trackPatternDetected(data: PatternAnalytics): void {
  trackEvent('pattern_detected', {
    pattern_type: data.patternType,
    confidence_bucket: getConfidenceBucket(data.confidence),
    correlation_strength: getCorrelationBucket(data.correlationStrength),
  });
}

function getConfidenceBucket(confidence: number): string {
  if (confidence < 0.5) return 'low';
  if (confidence < 0.75) return 'moderate';
  return 'high';
}

function getCorrelationBucket(strength: number): string {
  if (strength < 0.3) return 'weak';
  if (strength < 0.6) return 'moderate';
  return 'strong';
}

// ============================================
// FEATURE USAGE TRACKING
// ============================================

export function trackFeatureUsed(featureName: string, metadata?: Record<string, string | number | boolean>): void {
  trackEvent('feature_used', {
    feature_name: featureName,
    ...metadata,
  });
}

export function trackExportGenerated(exportType: 'csv' | 'pdf' | 'json' | 'wcb', recordCount: number): void {
  trackEvent('export_generated', {
    export_type: exportType,
    record_count_bucket: getRecordCountBucket(recordCount),
  });
}

function getRecordCountBucket(count: number): string {
  if (count <= 10) return 'small';
  if (count <= 50) return 'medium';
  if (count <= 200) return 'large';
  return 'very_large';
}

// ============================================
// CRISIS EVENT TRACKING
// ============================================

export interface CrisisAnalytics {
  severity: 'none' | 'mild' | 'moderate' | 'severe' | 'critical';
  triggerTypes: string[];
  autoActivatedEmergencyMode: boolean;
  durationSeconds?: number;
  resolutionMethod?: string;
}

export function trackCrisisDetected(severity: string): void {
  trackEvent('crisis_detected', {
    severity_level: severity,
  });
}

export function trackCrisisEvent(data: CrisisAnalytics): void {
  trackEvent('crisis_event', {
    severity: data.severity,
    trigger_count: data.triggerTypes.length,
    trigger_types: data.triggerTypes.join(','),
    auto_emergency_mode: data.autoActivatedEmergencyMode,
    duration_bucket: data.durationSeconds !== undefined 
      ? getCrisisDurationBucket(data.durationSeconds) 
      : undefined,
    resolution_method: data.resolutionMethod,
  });
}

function getCrisisDurationBucket(seconds: number): string {
  if (seconds < 60) return 'brief';
  if (seconds < 300) return 'short';
  if (seconds < 900) return 'moderate';
  return 'extended';
}

export function trackAccessibilityFeatureEnabled(feature: string): void {
  trackEvent('accessibility_feature_enabled', {
    feature_name: feature,
  });
}

// ============================================
// SESSION & ENGAGEMENT TRACKING
// ============================================

export function trackSessionStart(): void {
  trackEvent('session_start', {
    platform: getPlatform(),
    is_pwa: isPWA(),
  });
}

export function trackSessionEngagement(durationSeconds: number, actionsCount: number): void {
  trackEvent('session_engagement', {
    duration_bucket: getSessionDurationBucket(durationSeconds),
    actions_bucket: getActionsBucket(actionsCount),
  });
}

function getPlatform(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/windows/.test(ua)) return 'windows';
  if (/mac/.test(ua)) return 'mac';
  return 'other';
}

function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
}

function getSessionDurationBucket(seconds: number): string {
  if (seconds < 60) return 'brief';
  if (seconds < 300) return 'short';
  if (seconds < 900) return 'medium';
  return 'extended';
}

function getActionsBucket(count: number): string {
  if (count <= 3) return 'minimal';
  if (count <= 10) return 'moderate';
  if (count <= 25) return 'active';
  return 'very_active';
}

// ============================================
// EXPORT DEFAULT SERVICE OBJECT
// ============================================

export const AnalyticsTrackingService = {
  trackPainEntry,
  trackWeatherCorrelation,
  trackMoodEntry,
  trackActivityLog,
  trackMedicationLog,
  trackTriggerIdentified,
  trackPatternDetected,
  trackFeatureUsed,
  trackExportGenerated,
  trackCrisisDetected,
  trackCrisisEvent,
  trackAccessibilityFeatureEnabled,
  trackSessionStart,
  trackSessionEngagement,
  isAnalyticsEnabled,
};

export default AnalyticsTrackingService;

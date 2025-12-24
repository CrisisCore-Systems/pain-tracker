import { secureStorage } from '../lib/storage/secureStorage';

export const PRIVACY_SETTINGS_STORAGE_KEY = 'pain-tracker:privacy-settings';

export type PrivacySettings = {
  dataSharing: boolean;
  analyticsConsent: boolean;
  retentionDays: number;
  weatherAutoCapture: boolean;
};

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  dataSharing: false,
  analyticsConsent: true,
  retentionDays: 365,
  weatherAutoCapture: false,
};

export function readPrivacySettings(): PrivacySettings {
  const raw = secureStorage.safeJSON<Record<string, unknown>>(
    PRIVACY_SETTINGS_STORAGE_KEY,
    DEFAULT_PRIVACY_SETTINGS
  );

  const dataSharing = typeof raw.dataSharing === 'boolean' ? raw.dataSharing : DEFAULT_PRIVACY_SETTINGS.dataSharing;
  const analyticsConsent =
    typeof raw.analyticsConsent === 'boolean' ? raw.analyticsConsent : DEFAULT_PRIVACY_SETTINGS.analyticsConsent;

  const retentionCandidate = raw.retentionDays;
  const retentionDays =
    typeof retentionCandidate === 'number'
      ? retentionCandidate
      : typeof retentionCandidate === 'string'
        ? Number(retentionCandidate)
        : DEFAULT_PRIVACY_SETTINGS.retentionDays;

  const weatherAutoCapture =
    typeof raw.weatherAutoCapture === 'boolean'
      ? raw.weatherAutoCapture
      : DEFAULT_PRIVACY_SETTINGS.weatherAutoCapture;

  return {
    dataSharing,
    analyticsConsent,
    retentionDays: Number.isFinite(retentionDays) ? retentionDays : DEFAULT_PRIVACY_SETTINGS.retentionDays,
    weatherAutoCapture,
  };
}

export function writePrivacySettings(updates: Partial<PrivacySettings>): void {
  const current = readPrivacySettings();
  secureStorage.set(PRIVACY_SETTINGS_STORAGE_KEY, { ...current, ...updates });
}

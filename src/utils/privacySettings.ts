import { secureStorage } from '../lib/storage/secureStorage';

export const PRIVACY_SETTINGS_STORAGE_KEY = 'pain-tracker:privacy-settings';

export type PrivacySettings = {
  dataSharing: boolean;
  analyticsConsent: boolean;
  /** If enabled, trigger an emergency wipe after repeated failed vault unlock attempts. */
  vaultKillSwitchEnabled: boolean;
  retentionDays: number;
  weatherAutoCapture: boolean;
  /** If enabled, local-only usage counters may be incremented (no network). */
  localUsageCountersEnabled: boolean;
};

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  dataSharing: false,
  analyticsConsent: false,
  vaultKillSwitchEnabled: true,
  retentionDays: 365,
  weatherAutoCapture: false,
  localUsageCountersEnabled: true,
};

export function readPrivacySettings(): PrivacySettings {
  const raw = secureStorage.safeJSON<Record<string, unknown>>(
    PRIVACY_SETTINGS_STORAGE_KEY,
    DEFAULT_PRIVACY_SETTINGS
  );

  const dataSharing = typeof raw.dataSharing === 'boolean' ? raw.dataSharing : DEFAULT_PRIVACY_SETTINGS.dataSharing;
  const analyticsConsent =
    typeof raw.analyticsConsent === 'boolean' ? raw.analyticsConsent : DEFAULT_PRIVACY_SETTINGS.analyticsConsent;

  const vaultKillSwitchEnabled =
    typeof raw.vaultKillSwitchEnabled === 'boolean'
      ? raw.vaultKillSwitchEnabled
      : DEFAULT_PRIVACY_SETTINGS.vaultKillSwitchEnabled;

  const retentionCandidate = raw.retentionDays;
  let retentionDays: number = DEFAULT_PRIVACY_SETTINGS.retentionDays;
  if (typeof retentionCandidate === 'number') {
    retentionDays = retentionCandidate;
  } else if (typeof retentionCandidate === 'string') {
    retentionDays = Number(retentionCandidate);
  }

  const weatherAutoCapture =
    typeof raw.weatherAutoCapture === 'boolean'
      ? raw.weatherAutoCapture
      : DEFAULT_PRIVACY_SETTINGS.weatherAutoCapture;

  const localUsageCountersEnabled =
    typeof raw.localUsageCountersEnabled === 'boolean'
      ? raw.localUsageCountersEnabled
      : DEFAULT_PRIVACY_SETTINGS.localUsageCountersEnabled;

  return {
    dataSharing,
    analyticsConsent,
    vaultKillSwitchEnabled,
    retentionDays: Number.isFinite(retentionDays) ? retentionDays : DEFAULT_PRIVACY_SETTINGS.retentionDays,
    weatherAutoCapture,
    localUsageCountersEnabled,
  };
}

export function writePrivacySettings(updates: Partial<PrivacySettings>): void {
  const current = readPrivacySettings();
  secureStorage.set(PRIVACY_SETTINGS_STORAGE_KEY, { ...current, ...updates });
}

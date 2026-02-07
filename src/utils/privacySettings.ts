import { secureStorage } from '../lib/storage/secureStorage';

export const PRIVACY_SETTINGS_STORAGE_KEY = 'pain-tracker:privacy-settings';

export type PrivacySettings = {
  dataSharing: boolean;
  analyticsConsent: boolean;
  /** If enabled, trigger an emergency wipe after repeated failed vault unlock attempts. */
  vaultKillSwitchEnabled: boolean;
  retentionDays: number;
  weatherAutoCapture: boolean;
};

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  dataSharing: false,
  analyticsConsent: false,
  vaultKillSwitchEnabled: true,
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

  const vaultKillSwitchEnabled =
    typeof raw.vaultKillSwitchEnabled === 'boolean'
      ? raw.vaultKillSwitchEnabled
      : DEFAULT_PRIVACY_SETTINGS.vaultKillSwitchEnabled;

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
    vaultKillSwitchEnabled,
    retentionDays: Number.isFinite(retentionDays) ? retentionDays : DEFAULT_PRIVACY_SETTINGS.retentionDays,
    weatherAutoCapture,
  };
}

export function writePrivacySettings(updates: Partial<PrivacySettings>): void {
  const current = readPrivacySettings();
  secureStorage.set(PRIVACY_SETTINGS_STORAGE_KEY, { ...current, ...updates });
}

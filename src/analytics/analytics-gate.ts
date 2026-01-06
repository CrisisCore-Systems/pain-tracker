import { ANALYTICS_CONSENT_STORAGE_KEY } from '../stores/encrypted-idb-persist';

export type AnalyticsGateResult = {
  envEnabled: boolean;
  hasConsent: boolean;
};

function isEnvEnabled(): boolean {
  try {
    if (import.meta.env && typeof import.meta.env.VITE_ENABLE_ANALYTICS === 'string') {
      return import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    }
  } catch {
    // ignore
  }

  try {
    // Vitest / Node fallback
    const env =
      (typeof process !== 'undefined'
        ? (process as unknown as { env?: Record<string, string | undefined> }).env
        : undefined) || {};
    return env.VITE_ENABLE_ANALYTICS === 'true';
  } catch {
    return false;
  }
}

function readConsent(): boolean {
  try {
    const v = localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return v === 'granted';
  } catch {
    return false;
  }
}

export function getAnalyticsGate(): AnalyticsGateResult {
  return {
    envEnabled: isEnvEnabled(),
    hasConsent: readConsent(),
  };
}

export function isAnalyticsAllowed(): boolean {
  const gate = getAnalyticsGate();
  return gate.envEnabled && gate.hasConsent;
}

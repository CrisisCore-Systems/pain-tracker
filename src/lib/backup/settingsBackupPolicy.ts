import { z } from 'zod';

export const SETTINGS_BACKUP_SCHEMA = 'paintracker.settings-backup' as const;
export const SETTINGS_BACKUP_VERSION = 1 as const;

export const SETTINGS_BACKUP_LIMITS = {
  maxFileBytes: 2 * 1024 * 1024,
  maxKeys: 200,
  maxValueBytes: 100 * 1024,
} as const;

export type SettingsBackupEnvelopeV1 = z.infer<typeof SettingsBackupEnvelopeV1Schema>;

export const SettingsBackupEnvelopeV1Schema = z
  .object({
    schema: z.literal(SETTINGS_BACKUP_SCHEMA),
    version: z.literal(SETTINGS_BACKUP_VERSION),
    createdAt: z.string().min(1),
    appVersion: z.string().optional(),
    data: z.record(z.string(), z.unknown()),
  })
  .strict();

export type SettingsBackupImportAction = 'overwrite' | 'add' | 'skip-denied';

export type SettingsBackupImportRow = {
  key: string;
  action: SettingsBackupImportAction;
};

function bytesOfJson(value: unknown): number {
  const json = JSON.stringify(value);
  return new TextEncoder().encode(json).length;
}

const ALLOWED_PREFIXES = [
  'pain-tracker:',
  'ui:',
  'prefs:',
  'theme:',
  'accessibility:',
  'onboarding:',
  'export:',
  'hint-dismissed-',
  'trauma-informed-',
] as const;

const ALLOWED_EXACT = new Set<string>([
  'saved-filters',
  'trauma-informed-preferences',
  'pain-tracker-onboarding-completed',
]);

const DENY_PATTERNS: RegExp[] = [
  /^vault:/i,
  /auth/i,
  /token/i,
  /session/i,
  /admin/i,
  /secret/i,
  /key/i,
  /crypto/i,
  /^sync/i,
  /device-id/i,
  /user-id/i,
  /last-sync-time/i,
];

const DENY_EXACT = new Set<string>([
  'auth-token',
  'sync-client-id',
  'device-id',
  'user-id',
  'last-sync-time',
  // Known data-bearing keys we never include in settings backups
  'painEntries',
  'pain_tracker_entries',
  'pain-tracker-draft',
]);

export function isSettingsBackupKeyDenied(key: string): boolean {
  if (DENY_EXACT.has(key)) return true;
  if (key === '__proto__' || key === 'constructor' || key === 'prototype') return true;
  return DENY_PATTERNS.some(re => re.test(key));
}

export function isSettingsBackupKeyAllowed(key: string): boolean {
  if (isSettingsBackupKeyDenied(key)) return false;
  if (ALLOWED_EXACT.has(key)) return true;
  return ALLOWED_PREFIXES.some(p => key.startsWith(p));
}

export function buildSettingsBackupEnvelope(params: {
  allKeys: string[];
  readValue: (key: string) => unknown;
  now?: Date;
  appVersion?: string;
}): SettingsBackupEnvelopeV1 {
  const createdAt = (params.now ?? new Date()).toISOString();
  const data: Record<string, unknown> = Object.create(null);

  for (const key of params.allKeys) {
    if (!isSettingsBackupKeyAllowed(key)) continue;
    const value = params.readValue(key);
    if (bytesOfJson(value) > SETTINGS_BACKUP_LIMITS.maxValueBytes) continue;
    data[key] = value;
  }

  const keyCount = Object.keys(data).length;
  if (keyCount > SETTINGS_BACKUP_LIMITS.maxKeys) {
    throw new Error(
      `Backup contains too many keys (${keyCount}). Limit is ${SETTINGS_BACKUP_LIMITS.maxKeys}.`
    );
  }

  return {
    schema: SETTINGS_BACKUP_SCHEMA,
    version: SETTINGS_BACKUP_VERSION,
    createdAt,
    appVersion: params.appVersion,
    data,
  };
}

export function parseSettingsBackupEnvelopeJson(jsonText: string): SettingsBackupEnvelopeV1 {
  const parsed = JSON.parse(jsonText) as unknown;
  return SettingsBackupEnvelopeV1Schema.parse(parsed);
}

export function planSettingsBackupImport(params: {
  envelope: SettingsBackupEnvelopeV1;
  existingKeys: string[];
}): {
  safeData: Record<string, unknown>;
  preview: SettingsBackupImportRow[];
} {
  const dataRaw = params.envelope.data;
  const allKeys = Object.keys(dataRaw);
  if (allKeys.length > SETTINGS_BACKUP_LIMITS.maxKeys) {
    throw new Error(
      `Too many keys (${allKeys.length}). Limit is ${SETTINGS_BACKUP_LIMITS.maxKeys}.`
    );
  }

  const safeData: Record<string, unknown> = Object.create(null);

  for (const key of allKeys) {
    const value = dataRaw[key];

    if (!isSettingsBackupKeyAllowed(key)) {
      continue;
    }

    try {
      if (bytesOfJson(value) > SETTINGS_BACKUP_LIMITS.maxValueBytes) {
        continue;
      }
    } catch {
      continue;
    }

    safeData[key] = value;
  }

  const existing = new Set(params.existingKeys);
  const preview: SettingsBackupImportRow[] = [];
  for (const key of allKeys) {
    if (key in safeData) {
      preview.push({ key, action: existing.has(key) ? 'overwrite' : 'add' });
    } else {
      preview.push({ key, action: 'skip-denied' });
    }
  }

  const sortedPreview = preview.slice().sort((a, b) => a.key.localeCompare(b.key));

  return {
    safeData,
    preview: sortedPreview,
  };
}

export function applySettingsBackupImport(params: {
  safeData: Record<string, unknown>;
  confirmToken: string;
  writeValue: (key: string, value: unknown) => void;
}): { written: string[] } {
  if (params.confirmToken !== 'IMPORT') {
    return { written: [] };
  }

  const written: string[] = [];
  const keys = Object.keys(params.safeData).slice(0, SETTINGS_BACKUP_LIMITS.maxKeys);

  for (const key of keys) {
    const value = params.safeData[key];
    if (!isSettingsBackupKeyAllowed(key)) continue;
    if (bytesOfJson(value) > SETTINGS_BACKUP_LIMITS.maxValueBytes) continue;
    params.writeValue(key, value);
    written.push(key);
  }

  return { written };
}

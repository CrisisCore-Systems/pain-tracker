import { describe, expect, it, vi } from 'vitest';

import {
  SETTINGS_BACKUP_SCHEMA,
  SETTINGS_BACKUP_VERSION,
  applySettingsBackupImport,
  buildSettingsBackupEnvelope,
  isSettingsBackupKeyAllowed,
  parseSettingsBackupEnvelopeJson,
  planSettingsBackupImport,
} from '../lib/backup/settingsBackupPolicy';

describe('settings backup policy', () => {
  it('denied keys are never exported', () => {
    const keys = [
      'pain-tracker:ui-mode',
      'theme:dark',
      'vault:metadata',
      'auth-token',
      'painEntries',
    ];

    const envelope = buildSettingsBackupEnvelope({
      allKeys: keys,
      readValue: key => ({ key }),
      now: new Date('2026-02-27T00:00:00.000Z'),
    });

    expect(envelope.schema).toBe(SETTINGS_BACKUP_SCHEMA);
    expect(envelope.version).toBe(SETTINGS_BACKUP_VERSION);

    const exportedKeys = Object.keys(envelope.data);
    expect(exportedKeys).toContain('pain-tracker:ui-mode');
    expect(exportedKeys).toContain('theme:dark');

    expect(exportedKeys).not.toContain('vault:metadata');
    expect(exportedKeys).not.toContain('auth-token');
    expect(exportedKeys).not.toContain('painEntries');
  });

  it('parse rejects invalid schema/version', () => {
    expect(() =>
      parseSettingsBackupEnvelopeJson(
        JSON.stringify({ schema: 'nope', version: 1, createdAt: 'x', data: {} })
      )
    ).toThrow();

    expect(() =>
      parseSettingsBackupEnvelopeJson(
        JSON.stringify({ schema: SETTINGS_BACKUP_SCHEMA, version: 999, createdAt: 'x', data: {} })
      )
    ).toThrow();
  });

  it('denied keys are never imported (even with confirm)', () => {
    const envelope = parseSettingsBackupEnvelopeJson(
      JSON.stringify({
        schema: SETTINGS_BACKUP_SCHEMA,
        version: SETTINGS_BACKUP_VERSION,
        createdAt: '2026-02-27T00:00:00.000Z',
        data: {
          'pain-tracker:ui-mode': 'calm',
          'vault:metadata': { secret: true },
          'auth-token': 'abc',
        },
      })
    );

    const { safeData } = planSettingsBackupImport({ envelope, existingKeys: [] });

    const writeValue = vi.fn();
    const res = applySettingsBackupImport({
      safeData,
      confirmToken: 'IMPORT',
      writeValue,
    });

    expect(res.written).toEqual(['pain-tracker:ui-mode']);
    expect(writeValue).toHaveBeenCalledTimes(1);
    expect(writeValue).toHaveBeenCalledWith('pain-tracker:ui-mode', 'calm');
  });

  it('import does not write without confirm token', () => {
    const envelope = parseSettingsBackupEnvelopeJson(
      JSON.stringify({
        schema: SETTINGS_BACKUP_SCHEMA,
        version: SETTINGS_BACKUP_VERSION,
        createdAt: '2026-02-27T00:00:00.000Z',
        data: { 'pain-tracker:ui-mode': 'calm' },
      })
    );

    const { safeData } = planSettingsBackupImport({ envelope, existingKeys: [] });

    const writeValue = vi.fn();
    const res = applySettingsBackupImport({
      safeData,
      confirmToken: 'NOPE',
      writeValue,
    });

    expect(res.written).toEqual([]);
    expect(writeValue).not.toHaveBeenCalled();
  });

  it('rolls back already written keys when a later write fails', () => {
    const store = new Map<string, unknown>([
      ['theme:mode', 'light'],
      ['prefs:contrast', 'normal'],
    ]);

    const envelope = parseSettingsBackupEnvelopeJson(
      JSON.stringify({
        schema: SETTINGS_BACKUP_SCHEMA,
        version: SETTINGS_BACKUP_VERSION,
        createdAt: '2026-02-27T00:00:00.000Z',
        data: {
          'theme:mode': 'dark',
          'prefs:contrast': 'high',
          'prefs:text-size': 'large',
        },
      })
    );

    const { safeData } = planSettingsBackupImport({
      envelope,
      existingKeys: Array.from(store.keys()),
    });

    const writeValue = vi.fn((key: string, value: unknown) => {
      if (key === 'prefs:contrast' && value === 'high') {
        throw new Error('WRITE_FAILED');
      }
      store.set(key, value);
    });

    expect(() =>
      applySettingsBackupImport({
        safeData,
        confirmToken: 'IMPORT',
        existingKeys: Array.from(store.keys()),
        readValue: key => store.get(key),
        removeValue: key => {
          store.delete(key);
        },
        writeValue,
      })
    ).toThrow('WRITE_FAILED');

    expect(store.get('theme:mode')).toBe('light');
    expect(store.get('prefs:contrast')).toBe('normal');
    expect(store.has('prefs:text-size')).toBe(false);
  });

  it('key allow/deny keeps prototype keys blocked', () => {
    expect(isSettingsBackupKeyAllowed('__proto__')).toBe(false);
    expect(isSettingsBackupKeyAllowed('constructor')).toBe(false);
    expect(isSettingsBackupKeyAllowed('prototype')).toBe(false);
  });
});

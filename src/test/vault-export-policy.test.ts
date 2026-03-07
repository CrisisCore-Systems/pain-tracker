import { describe, expect, it } from 'vitest';

import {
  VAULT_EXPORT_SCHEMA,
  VAULT_EXPORT_VERSION,
  VAULT_EXPORT_LIMITS,
  buildVaultPayloadV1,
  createVaultExportV1,
  decryptVaultExportV1,
} from '../lib/vault-export/vaultExportPolicy';

function makeEntry(overrides?: Record<string, unknown>) {
  return {
    timestamp: new Date('2026-02-27T00:00:00.000Z').toISOString(),
    baselineData: { pain: 5, locations: [], symptoms: [] },
    notes: 'NEVER_PLAINTEXT_123',
    ...overrides,
  };
}

describe('vault export v1 policy', () => {
  it('roundtrips with correct passphrase + confirm tokens', async () => {
    const payload = buildVaultPayloadV1({ entries: [makeEntry()] });

    const env = await createVaultExportV1({
      payload,
      passphrase: 'correct horse battery staple',
      confirmToken: 'EXPORT',
    });

    expect(env.schema).toBe(VAULT_EXPORT_SCHEMA);
    expect(env.version).toBe(VAULT_EXPORT_VERSION);
    expect(env.manifest?.recordCounts?.entries).toBe(1);
    expect(env.ciphertextB64).toBeTruthy();

    const json = JSON.stringify(env, null, 2);
    // Extremely low false-positive risk; catches accidental plaintext embedding.
    expect(json).not.toContain('NEVER_PLAINTEXT_123');

    const restored = await decryptVaultExportV1({
      vaultExportJson: json,
      passphrase: 'correct horse battery staple',
      confirmToken: 'IMPORT',
    });

    expect(restored.entries).toHaveLength(1);
    expect(restored.entries[0]?.baselineData?.pain).toBe(5);
  });

  it('rejects export without typed confirm token', async () => {
    const payload = buildVaultPayloadV1({ entries: [makeEntry()] });
    await expect(
      createVaultExportV1({
        payload,
        passphrase: 'correct horse battery staple',
        confirmToken: 'NOPE',
      })
    ).rejects.toThrow(/confirm token/i);
  });

  it('rejects import without typed confirm token', async () => {
    const payload = buildVaultPayloadV1({ entries: [makeEntry()] });
    const env = await createVaultExportV1({
      payload,
      passphrase: 'correct horse battery staple',
      confirmToken: 'EXPORT',
    });

    const json = JSON.stringify(env);
    await expect(
      decryptVaultExportV1({
        vaultExportJson: json,
        passphrase: 'correct horse battery staple',
        confirmToken: 'NOPE',
      })
    ).rejects.toThrow(/confirm token/i);
  });

  it('rejects wrong passphrase', async () => {
    const payload = buildVaultPayloadV1({ entries: [makeEntry()] });
    const env = await createVaultExportV1({
      payload,
      passphrase: 'correct horse battery staple',
      confirmToken: 'EXPORT',
    });

    await expect(
      decryptVaultExportV1({
        vaultExportJson: JSON.stringify(env),
        passphrase: 'wrong passphrase totally',
        confirmToken: 'IMPORT',
      })
    ).rejects.toThrow(/Failed to decrypt/i);
  });

  it('rejects schema/version mismatch', async () => {
    const payload = buildVaultPayloadV1({ entries: [makeEntry()] });
    const env = await createVaultExportV1({
      payload,
      passphrase: 'correct horse battery staple',
      confirmToken: 'EXPORT',
    });

    const bad = { ...env, schema: 'not.a.schema' };
    await expect(
      decryptVaultExportV1({
        vaultExportJson: JSON.stringify(bad),
        passphrase: 'correct horse battery staple',
        confirmToken: 'IMPORT',
      })
    ).rejects.toThrow();
  });

  it('rejects suspiciously low PBKDF2 iterations', async () => {
    const payload = buildVaultPayloadV1({ entries: [makeEntry()] });
    const env = await createVaultExportV1({
      payload,
      passphrase: 'correct horse battery staple',
      confirmToken: 'EXPORT',
    });

    const bad = {
      ...env,
      kdf: { ...env.kdf, params: { ...env.kdf.params, iterations: 1 } },
    };

    await expect(
      decryptVaultExportV1({
        vaultExportJson: JSON.stringify(bad),
        passphrase: 'correct horse battery staple',
        confirmToken: 'IMPORT',
      })
    ).rejects.toThrow(/KDF params/i);
  });

  it('enforces approximate plaintext size cap', async () => {
    const bigNotes = 'a'.repeat(VAULT_EXPORT_LIMITS.maxApproxPlainBytes + 1024);
    const payload = buildVaultPayloadV1({ entries: [makeEntry({ notes: bigNotes })] });

    await expect(
      createVaultExportV1({
        payload,
        passphrase: 'correct horse battery staple',
        confirmToken: 'EXPORT',
      })
    ).rejects.toThrow(/exceeds max size/i);
  });
});

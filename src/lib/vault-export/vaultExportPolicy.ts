import { z } from 'zod';

import { securityService } from '../../services/SecurityService';
import { vaultService } from '../../services/VaultService';
import { PainEntrySchema } from '../../types/pain-entry';
import type { PainEntry } from '../../types';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

// -----------------------------
// Constants + Types
// -----------------------------

export const VAULT_EXPORT_SCHEMA = 'paintracker.vault-export' as const;
export const VAULT_EXPORT_VERSION = 1 as const;

export const VAULT_EXPORT_CONFIRM_EXPORT_TOKEN = 'EXPORT' as const;
export const VAULT_EXPORT_CONFIRM_IMPORT_TOKEN = 'IMPORT' as const;

export const VAULT_EXPORT_KDF_SUITE = 'PBKDF2-HMAC-SHA256' as const;
export const VAULT_EXPORT_CIPHER_SUITE = 'AES-256-GCM' as const;

// Doctrine: exports created by production builds must never use tiny PBKDF2 iteration counts.
// (Unit tests intentionally use a reduced count for runtime.)
export const VAULT_EXPORT_PROD_MIN_ITERATIONS = 150_000 as const;

export const VAULT_EXPORT_LIMITS = {
  // Keep bounded even for long-lived users. We can revisit as real-world needs emerge.
  maxEntries: 20_000,
  maxApproxPlainBytes: 10 * 1024 * 1024,
  maxCiphertextBytes: 12 * 1024 * 1024,
  // UI/flow guard: do not accept arbitrarily huge files.
  maxFileBytes: 14 * 1024 * 1024,
} as const;

// Chokepoint guard entry: pin doctrine without brittle file-parsing.
export const VAULT_EXPORT_CONSTANTS = {
  SCHEMA: VAULT_EXPORT_SCHEMA,
  VERSION: VAULT_EXPORT_VERSION,
  KDF: VAULT_EXPORT_KDF_SUITE,
  CIPHER: VAULT_EXPORT_CIPHER_SUITE,
  CONFIRM_EXPORT: VAULT_EXPORT_CONFIRM_EXPORT_TOKEN,
  CONFIRM_IMPORT: VAULT_EXPORT_CONFIRM_IMPORT_TOKEN,
  PROD_MIN_ITERATIONS: VAULT_EXPORT_PROD_MIN_ITERATIONS,
  LIMITS: VAULT_EXPORT_LIMITS,
} as const;

export type VaultExportKdfNameV1 = 'pbkdf2';
export type VaultExportCryptoAlgV1 = 'AES-256-GCM';

export type VaultExportV1 = {
  schema: typeof VAULT_EXPORT_SCHEMA;
  version: typeof VAULT_EXPORT_VERSION;
  createdAt: string;
  appVersion?: string;
  kdf: {
    name: VaultExportKdfNameV1;
    params: Record<string, number>;
    saltB64: string;
  };
  crypto: {
    alg: VaultExportCryptoAlgV1;
    nonceB64: string;
  };
  ciphertextB64: string;
  manifest?: {
    recordCounts: Record<string, number>;
    approxPlainBytes: number;
  };
};

export type VaultPayloadV1 = {
  // Use schema-inferred entry typing so we can accept legacy exports where `id` may be absent.
  // We normalize IDs at apply-time before writing into the store.
  entries: Array<z.infer<typeof PainEntrySchema>>;
};

const VaultPayloadV1Schema = z.object({
  entries: z.array(PainEntrySchema),
});

const VaultExportV1Schema: z.ZodType<VaultExportV1> = z.object({
  schema: z.literal(VAULT_EXPORT_SCHEMA),
  version: z.literal(VAULT_EXPORT_VERSION),
  createdAt: z.string(),
  appVersion: z.string().optional(),
  kdf: z.object({
    name: z.literal('pbkdf2'),
    params: z.record(z.string(), z.number()),
    saltB64: z.string(),
  }),
  crypto: z.object({
    alg: z.literal('AES-256-GCM'),
    nonceB64: z.string(),
  }),
  ciphertextB64: z.string(),
  manifest: z
    .object({
      recordCounts: z.record(z.string(), z.number()),
      approxPlainBytes: z.number(),
    })
    .optional(),
});

// -----------------------------
// Small helpers (realm-safe)
// -----------------------------

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(buffer).toString('base64');
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCodePoint(bytes[i] ?? 0);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(base64, 'base64');
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    // Ensure we always hand WebCrypto a plain ArrayBuffer-backed view.
    return new Uint8Array(ab);
  }
  const binary = atob(base64);
  const ab = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(ab);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.codePointAt(i) ?? 0;
  return bytes;
}

function approxUtf8Bytes(s: string): number {
  // Blob is available in browsers and jsdom; Buffer is available in Node.
  if (typeof Buffer !== 'undefined') return Buffer.byteLength(s, 'utf8');
  return new Blob([s]).size;
}

function constantTimeTokenEqual(a: string, b: string): boolean {
  // Avoid subtle timing differences for confirm tokens.
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0);
  }
  return out === 0;
}

function getIterationCountForEnv(): number {
  try {
    if (typeof process === 'undefined') return 310000;
    const env = (process as unknown as { env?: Record<string, string | undefined> }).env || {};
    if (env.VITEST || env.NODE_ENV === 'test') return 500;
  } catch {
    // ignore
  }
  return 310000;
}

function getIterationFloorForEnv(): number {
  const iterations = getIterationCountForEnv();
  // In unit tests we intentionally reduce PBKDF2 iterations for runtime.
  // In app/runtime builds, reject suspiciously-low iteration counts.
  if (iterations < 10_000) return iterations;
  return VAULT_EXPORT_PROD_MIN_ITERATIONS;
}

async function deriveAesGcmKeyFromPassphrasePBKDF2(params: {
  passphrase: string;
  salt: Uint8Array;
  iterations: number;
}): Promise<CryptoKey> {
  const pwUtf8 = new TextEncoder().encode(params.passphrase);
  const baseKey = await crypto.subtle.importKey('raw', pwUtf8, 'PBKDF2', false, [
    'deriveKey',
  ]);

  // Note: PBKDF2 uses SHA-256 by convention here; we intentionally pin that.
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new Uint8Array(params.salt), iterations: params.iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptJsonAesGcm(params: {
  key: CryptoKey;
  nonce: Uint8Array;
  plaintextJson: string;
}): Promise<Uint8Array> {
  const data = new TextEncoder().encode(params.plaintextJson);
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: new Uint8Array(params.nonce) },
    params.key,
    data
  );
  return new Uint8Array(cipher);
}

function bytesToPlainArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function decryptJsonAesGcm(params: {
  key: CryptoKey;
  nonce: Uint8Array;
  ciphertext: Uint8Array;
}): Promise<string> {
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(params.nonce) },
    params.key,
    new Uint8Array(params.ciphertext)
  );
  return new TextDecoder().decode(plain);
}

// -----------------------------
// Public API
// -----------------------------

export function buildVaultPayloadV1(input: { entries: unknown }): VaultPayloadV1 {
  const parsed = VaultPayloadV1Schema.parse({ entries: input.entries });
  if (parsed.entries.length > VAULT_EXPORT_LIMITS.maxEntries) {
    throw new Error(`Vault export exceeds maxEntries (${VAULT_EXPORT_LIMITS.maxEntries})`);
  }
  return parsed;
}

export async function createVaultExportV1(params: {
  payload: VaultPayloadV1;
  passphrase: string;
  confirmToken: string;
  appVersion?: string;
}): Promise<VaultExportV1> {
  if (!constantTimeTokenEqual(params.confirmToken, VAULT_EXPORT_CONFIRM_EXPORT_TOKEN)) {
    throw new Error('Export confirm token missing/invalid');
  }
  if (!params.passphrase || params.passphrase.length < 12) {
    throw new Error('Passphrase must be at least 12 characters');
  }

  const plaintextJson = JSON.stringify(params.payload);
  const approxPlainBytes = approxUtf8Bytes(plaintextJson);
  if (approxPlainBytes > VAULT_EXPORT_LIMITS.maxApproxPlainBytes) {
    throw new Error('Vault payload exceeds max size');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const iterations = getIterationCountForEnv();

  const key = await deriveAesGcmKeyFromPassphrasePBKDF2({
    passphrase: params.passphrase,
    salt,
    iterations,
  });

  const ciphertext = await encryptJsonAesGcm({ key, nonce, plaintextJson });
  if (ciphertext.byteLength > VAULT_EXPORT_LIMITS.maxCiphertextBytes) {
    throw new Error('Vault ciphertext exceeds max size');
  }

  return {
    schema: VAULT_EXPORT_SCHEMA,
    version: VAULT_EXPORT_VERSION,
    createdAt: new Date().toISOString(),
    appVersion: params.appVersion,
    kdf: {
      name: 'pbkdf2',
      // Spec is numeric-only params; we pin SHA-256 by protocol.
      params: { iterations, dkLen: 32 },
      saltB64: arrayBufferToBase64(salt.buffer),
    },
    crypto: {
      alg: 'AES-256-GCM',
      nonceB64: arrayBufferToBase64(nonce.buffer),
    },
    ciphertextB64: arrayBufferToBase64(bytesToPlainArrayBuffer(ciphertext)),
    manifest: {
      recordCounts: { entries: params.payload.entries.length },
      approxPlainBytes,
    },
  };
}

export async function decryptVaultExportV1(params: {
  vaultExportJson: string;
  passphrase: string;
  confirmToken: string;
}): Promise<VaultPayloadV1> {
  if (!constantTimeTokenEqual(params.confirmToken, VAULT_EXPORT_CONFIRM_IMPORT_TOKEN)) {
    throw new Error('Import confirm token missing/invalid');
  }
  if (!params.passphrase || params.passphrase.length < 12) {
    throw new Error('Passphrase must be at least 12 characters');
  }

  if (approxUtf8Bytes(params.vaultExportJson) > VAULT_EXPORT_LIMITS.maxFileBytes) {
    throw new Error('Vault export file too large');
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(params.vaultExportJson) as unknown;
  } catch {
    throw new Error('Vault export is not valid JSON');
  }

  const envelope = VaultExportV1Schema.parse(parsedJson);

  const iterations = envelope.kdf.params.iterations;
  const minIterations = getIterationFloorForEnv();
  if (!Number.isInteger(iterations) || iterations < minIterations) {
    throw new Error('Vault export KDF params invalid');
  }

  const salt = base64ToBytes(envelope.kdf.saltB64);
  const nonce = base64ToBytes(envelope.crypto.nonceB64);
  const ciphertext = base64ToBytes(envelope.ciphertextB64);
  if (ciphertext.byteLength > VAULT_EXPORT_LIMITS.maxCiphertextBytes) {
    throw new Error('Vault export ciphertext too large');
  }

  const key = await deriveAesGcmKeyFromPassphrasePBKDF2({
    passphrase: params.passphrase,
    salt,
    iterations,
  });

  let plaintextJson: string;
  try {
    plaintextJson = await decryptJsonAesGcm({ key, nonce, ciphertext });
  } catch {
    // Avoid leaking details.
    throw new Error('Failed to decrypt vault export (bad passphrase or corrupted file)');
  }

  // Validate plaintext payload structure before returning.
  let payloadUnknown: unknown;
  try {
    payloadUnknown = JSON.parse(plaintextJson) as unknown;
  } catch {
    throw new Error('Decrypted vault payload is not valid JSON');
  }

  const payload = VaultPayloadV1Schema.parse(payloadUnknown);
  if (payload.entries.length > VAULT_EXPORT_LIMITS.maxEntries) {
    throw new Error(`Vault payload exceeds maxEntries (${VAULT_EXPORT_LIMITS.maxEntries})`);
  }
  return payload;
}

function ensureEntryHasId(entry: PainEntry): PainEntry {
  if (entry.id !== undefined && entry.id !== null) return entry;
  const newId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  return { ...entry, id: newId };
}

export function applyVaultPayloadToStore(params: {
  payload: VaultPayloadV1;
  mode: 'merge';
}): { mergedCount: number; totalEntries: number } {
  if (!vaultService.isUnlocked()) {
    throw new Error('Vault is locked. Unlock the vault before importing health data.');
  }

  const existing = usePainTrackerStore.getState().entries;

  // Merge: same ID overwrites, otherwise append.
  const byId = new Map<string, PainEntry>();
  for (const e of existing) {
    if (e.id === undefined || e.id === null) continue;
    byId.set(String(e.id), e);
  }

  let mergedCount = 0;
  const next: PainEntry[] = [...existing];

  for (const raw of params.payload.entries) {
    const validated = ensureEntryHasId(PainEntrySchema.parse(raw) as PainEntry);
    const key = String(validated.id);
    if (byId.has(key)) {
      // Overwrite existing entry with same id (preserve list order position).
      const idx = next.findIndex(x => String(x.id) === key);
      if (idx >= 0) next[idx] = validated;
      else next.push(validated);
      mergedCount++;
    } else {
      byId.set(key, validated);
      next.push(validated);
      mergedCount++;
    }
  }

  usePainTrackerStore.setState({ entries: next });

  return { mergedCount, totalEntries: next.length };
}

export function logVaultExportFailure(event: {
  stage: 'export' | 'import';
  reason: string;
}): void {
  try {
    securityService.logSecurityEvent({
      type: 'vault',
      level: 'error',
      message: `Vault ${event.stage} failed`,
      metadata: { reason: event.reason },
      timestamp: new Date(),
    });
  } catch {
    // ignore logging failures
  }
}

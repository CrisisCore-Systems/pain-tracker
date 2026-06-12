import type { DuressEngineConfig, DuressKeyMaterial, DuressQueryResult } from './types';

const subtle = (globalThis as any).crypto?.subtle ?? (globalThis as any).msCrypto?.subtle;

export async function importRawKey(bytes: Uint8Array): Promise<CryptoKey> {
  return subtle.importKey('raw', bytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export function randomBytes(length: number): Uint8Array {
  const out = new Uint8Array(length);
  crypto.getRandomValues(out);
  return out;
}

export async function derivePassphraseKey(
  passphrase: string,
  salt: Uint8Array,
  iterations = 200_000
): Promise<CryptoKey> {
  const baseKey = await subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function entropyLooksRealistic(cipherBytes: Uint8Array): boolean {
  let nonZero = 0;
  for (let i = 0; i < cipherBytes.length; i++) {
    if (cipherBytes[i] !== 0) nonZero++;
  }
  const ratio = nonZero / cipherBytes.length;
  return ratio > 0.4 && ratio < 0.6;
}

export async function encryptToSlots(
  key: CryptoKey,
  slots: Array<Record<string, unknown>>
): Promise<Uint8Array[]> {
  const out: Uint8Array[] = [];
  for (const slot of slots) {
    const iv = randomBytes(12);
    const encoded = new TextEncoder().encode(JSON.stringify(slot));
    const cipher = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded));
    out.push(cipher);
  }
  return out;
}

export function queryDecoy(cipherBytes: Uint8Array, _realKey: CryptoKey): DuressQueryResult {
  const looksReal = entropyLooksRealistic(cipherBytes);
  return {
    tier: looksReal ? 'real' : 'invalid',
    lookedLikeReal: looksReal,
    slotsFilled: 1,
    decoyReadable: false,
  };
}

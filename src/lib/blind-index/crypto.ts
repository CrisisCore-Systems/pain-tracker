export async function deriveBlindToken(value: string, pepper: Uint8Array): Promise<string> {
  const data = new TextEncoder().encode(value);
  const key = await crypto.subtle.importKey('raw', new Uint8Array(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const bytes = new Uint8Array(signature);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function normalizeFieldValue(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

export function tokenizeFieldValue(value: unknown, pepper: Uint8Array): Promise<string> {
  return deriveBlindToken(normalizeFieldValue(value), pepper);
}

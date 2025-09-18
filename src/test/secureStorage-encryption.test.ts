import { describe, it, expect, beforeEach } from 'vitest';
import { secureStorage } from '../lib/storage/secureStorage';

// Simple reversible transform (not real crypto) for test
const enc = (s: string) => `x${Buffer.from(s,'utf8').toString('base64')}`;
const dec = (s: string) => Buffer.from(s.slice(1), 'base64').toString('utf8');

beforeEach(() => {
  localStorage.clear();
});

describe('secureStorage encryption hook', () => {
  it('stores encrypted form and retrieves decrypted object', () => {
    const value = { a: 1, b: 'test' };
    const res = secureStorage.set('enc_test', value, { encrypt: true, encryptFn: enc });
    expect(res.success).toBe(true);
    // Raw value should be encrypted
    const raw = localStorage.getItem('pt:enc_test');
    expect(raw && raw.startsWith('x')).toBe(true);
    const out = secureStorage.get('enc_test', { encrypt: true, decryptFn: dec });
    expect(out).toEqual(value);
  });

  it('fails gracefully on bad decrypt', () => {
    const value = { z: 9 };
    secureStorage.set('bad_dec', value, { encrypt: true, encryptFn: enc });
    const broken = secureStorage.get('bad_dec', { encrypt: true, decryptFn: () => { throw new Error('nope'); } });
    expect(broken).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { secureStorage } from '../lib/storage/secureStorage';

describe('secureStorage', () => {
  it('stores and retrieves JSON object', () => {
    const res = secureStorage.set('prefs', { a: 1 });
    expect(res.success).toBe(true);
    expect(secureStorage.get<{ a: number }>('prefs')?.a).toBe(1);
  });
  it('guards invalid key', () => {
    const res = secureStorage.set('INVALID KEY', 1);
    expect(res.success).toBe(false);
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import { SecurityService } from '../services/SecurityService';

// Provide a minimal localStorage shim if not present (jsdom should have it)

describe('SecurityService core behaviors', () => {
  let svc: SecurityService;
  beforeAll(() => {
    svc = new SecurityService(undefined, { consentRequired: true });
  });

  it('logs events and trims when exceeding limit', () => {
    for (let i = 0; i < 1100; i++) {
      svc.logSecurityEvent({ type: 'audit', level: 'info', message: `e${i}`, timestamp: new Date() });
    }
    const events = svc.getSecurityEvents();
    expect(events.length).toBeLessThanOrEqual(1000); // trimming logic
  });

  it('secure storage encrypt/decrypt cycle works after master key init', async () => {
    await svc.initializeMasterKey();
    const store = svc.createSecureStorage();
    await store.store('k1', { alpha: 1 }, true);
  const val = await store.retrieve('k1', true) as { alpha: number } | null;
  expect(val?.alpha).toBe(1);
  });

  it('decryptData errors without key', async () => {
    const tmp = new SecurityService();
    await expect(tmp.decryptData('notvalid')).rejects.toThrow(/Decryption key not available/);
  });
});

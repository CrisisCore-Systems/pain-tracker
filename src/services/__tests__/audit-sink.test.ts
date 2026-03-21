import { InMemoryAuditSink } from '../SecureAuditSink';

describe('InMemoryAuditSink', () => {
  it('appends events and signs them with the audit key', async () => {
    const key = 'fixture-audit-material';
    const sink = new InMemoryAuditSink(key);
    const evt = {
      eventId: '1',
      timestamp: new Date().toISOString(),
      eventType: 'TEST_EVENT',
      userIdHmac: 'hmac',
      details: { foo: 'bar' },
    };
    const signed = await sink.append(evt);
    expect(signed.signature).toBeDefined();
    // The in-memory sink uses a deterministic mock signature for test-only stability.
    expect(signed.signature).toMatch(/^mock-sig-0-k\d+$/);
    const events = sink.getEvents();
    expect(events.length).toBe(1);
  });
});

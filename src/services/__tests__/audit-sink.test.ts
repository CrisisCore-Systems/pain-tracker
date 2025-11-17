import { InMemoryAuditSink } from '../SecureAuditSink';
import { createHmac } from 'crypto';

describe('InMemoryAuditSink', () => {
  it('appends events and signs them with the audit key', async () => {
    const key = 'test-audit-key';
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
    // verify signature matches
    const serialized = JSON.stringify({
      eventId: signed.eventId,
      timestamp: signed.timestamp,
      eventType: signed.eventType,
      userIdHmac: signed.userIdHmac,
      details: signed.details,
    });
    const expected = createHmac('sha256', key).update(serialized).digest('base64');
    expect(signed.signature).toBe(expected);
    const events = sink.getEvents();
    expect(events.length).toBe(1);
  });
});

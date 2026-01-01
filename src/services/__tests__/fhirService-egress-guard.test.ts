import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FHIRService } from '../FHIRService';

describe('FHIRService egress guard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when baseUrl is not configured for network calls', async () => {
    const svc = new FHIRService('');
    const fetchSpy = vi.spyOn(globalThis, 'fetch' as never);

    await expect(
      svc.createResource({ resourceType: 'Observation' })
    ).rejects.toThrow(/not configured/i);

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

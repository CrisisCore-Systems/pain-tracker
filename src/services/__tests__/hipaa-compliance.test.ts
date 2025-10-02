import { describe, it, expect } from 'vitest';
import { createHIPAACompliance } from '../HIPAACompliance';

describe('HIPAACompliance', () => {
  it('detects simple PHI patterns', () => {
    const svc = createHIPAACompliance();
    const r = svc.detectPHI('Contact me at 123-45-6789 or test@example.com');
    expect(r.found).toBe(true);
    expect(r.matches.length).toBeGreaterThanOrEqual(1);
  });
});

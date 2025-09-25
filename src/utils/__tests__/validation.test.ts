import { assertNumericRange, sanitizeNote } from '../validation';

describe('validation helpers', () => {
  test('assertNumericRange accepts valid values', () => {
    expect(assertNumericRange(5, 'score', 0, 10)).toBe(true);
  });

  test('assertNumericRange rejects null/undefined', () => {
    expect(() => assertNumericRange(null as any, 'score', 0, 10)).toThrow('score is required');
  });

  test('assertNumericRange rejects out of range', () => {
    expect(() => assertNumericRange(11, 'score', 0, 10)).toThrow('score must be between 0 and 10');
  });

  test('sanitizeNote strips long digit sequences and truncates', () => {
    const note = 'Patient id 123456789 had pain.' + 'a'.repeat(1200);
    const sanitized = sanitizeNote(note, 200);
    expect(sanitized).toContain('[REDACTED]');
    expect(sanitized.length).toBeLessThanOrEqual(204); // 200 + '...'
  });
});

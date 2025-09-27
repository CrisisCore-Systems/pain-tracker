import { describe, it, expect } from 'vitest';
import { PrivacyBudgetManager } from '../PrivacyBudgetManager';

describe('PrivacyBudgetManager', () => {
  it('returns default epsilon when none set', () => {
    const m = new PrivacyBudgetManager(2.0);
    expect(m.getRemaining('u1')).toBe(2.0);
  });

  it('consumes and prevents over-consumption', () => {
    const m = new PrivacyBudgetManager(1.0);
    expect(m.consume('u1', 0.3)).toBe(true);
    expect(m.getRemaining('u1')).toBeCloseTo(0.7);
    expect(m.consume('u1', 0.8)).toBe(false);
    expect(m.getRemaining('u1')).toBeCloseTo(0.7);
  });

  it('reset sets a new budget', () => {
    const m = new PrivacyBudgetManager(1.0);
    m.consume('u1', 0.5);
    m.reset('u1', 5.0);
    expect(m.getRemaining('u1')).toBe(5.0);
  });
});

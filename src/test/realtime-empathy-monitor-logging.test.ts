import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('RealTimeEmpathyMonitor logging hygiene', () => {
  it('does not log raw user identifiers when monitoring starts', () => {
    const monitorPath = path.resolve(process.cwd(), 'src/services/RealTimeEmpathyMonitor.ts');
    const source = fs.readFileSync(monitorPath, 'utf8');

    expect(source).not.toContain('Real-time empathy monitoring started for user');
  });
});
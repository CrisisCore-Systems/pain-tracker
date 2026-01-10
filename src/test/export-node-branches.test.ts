// @vitest-environment node

import { describe, it, expect } from 'vitest';

describe('export.ts node-only branches', () => {
  it('downloadData returns early when window is undefined', async () => {
    const { downloadData } = await import('../utils/pain-tracker/export');

    expect(() => downloadData('hello', 'hello.txt')).not.toThrow();
  });
});

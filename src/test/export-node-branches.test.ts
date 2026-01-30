// @vitest-environment node

import { describe, it, expect, vi } from 'vitest';

// This test runs in a Node environment (no `window`). Importing the export module
// should not require browser-only or heavy init dependencies.
// Mock these to prevent any accidental side effects/top-level awaits from hanging.
vi.mock('../services/PrivacyAnalyticsService', () => ({
  privacyAnalytics: {
    trackDataExport: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../analytics/ga4-events', () => ({
  trackDataExported: vi.fn(),
}));

vi.mock('../utils/usage-tracking', () => ({
  trackExport: vi.fn(),
}));

vi.mock('../lib/debug-logger', () => ({
  analyticsLogger: {
    swallowed: vi.fn(),
  },
}));

vi.mock('../services/clinical/FhirMapper', () => ({
  FhirMapper: {
    toGenericBundle: vi.fn(() => ({
      resourceType: 'Bundle',
      type: 'collection',
      entry: [],
    })),
  },
}));

describe('export.ts node-only branches', () => {
  it('downloadData returns early when window is undefined', async () => {
    const { downloadData } = await import('../utils/pain-tracker/export');

    expect(() => downloadData('hello', 'hello.txt')).not.toThrow();
  });
});

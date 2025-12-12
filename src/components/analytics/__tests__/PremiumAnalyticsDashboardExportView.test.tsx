import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { PremiumAnalyticsDashboard } from '../PremiumAnalyticsDashboard';
import type { PainEntry } from '../../../types';

// Minimal entries array - ExportView uses sorted entries and analytics snapshot
const sampleEntries: PainEntry[] = [];

describe('PremiumAnalyticsDashboard Export & Share copy', () => {
  it('shows trauma-informed clipboard fallback messaging when copy fails', async () => {
    render(<PremiumAnalyticsDashboard entries={sampleEntries} />);

    // Navigate to Export & Share tab and wait for the export view to mount
    const exportTab = screen.getByRole('button', { name: /Export & Share/i });
    exportTab.click();

    // Wait for the export textarea to appear so the view is fully rendered
    await screen.findByRole('textbox');

    // Mock the clipboard to reject so the component path triggers the fallback
    // Use vi to stub navigator.clipboard.writeText
    // Override navigator.clipboard in the test environment.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalNavigator = (globalThis as any).navigator;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).navigator = {
      ...(originalNavigator || {}),
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard not available')),
      },
    };

    try {
      // Trigger a copy attempt which will fail in the test environment and surface the
      // trauma-informed fallback messaging inside the export view.
      const copyBtn = await screen.findByRole('button', { name: /Copy summary/i });
      copyBtn.click();

      // Wait for the clipboard error alert specifically (contains clipboard-related messaging)
      // Note: There may be other alerts from emotional validation, so we find all and filter
      const alerts = await screen.findAllByRole('alert', {}, { timeout: 2000 });
      const clipboardAlert = alerts.find((alert) =>
        /clipboard|copy|unavailable|select|highlight/i.test(alert.textContent || '')
      );
      expect(clipboardAlert).toBeDefined();
      expect(clipboardAlert).toBeInTheDocument();
    } finally {
      // restore navigator to avoid leaking test globals
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).navigator = originalNavigator;
    }
  });
});

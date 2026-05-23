import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubscriptionProvider } from '../../../contexts/SubscriptionContext';
import { subscriptionService } from '../../../services/SubscriptionService';
import { GatedPDFReport, GatedWCBReport } from '../GatedExport';
import { WCBReportPanel } from '../../widgets/WCBReportPanel';

let currentUserId = 'ui-tier-user';

vi.mock('../../../utils/user-identity', () => ({
  getLocalUserId: () => currentUserId,
}));

vi.mock('../../../stores/pain-tracker-store', () => ({
  usePainTrackerStore: () => ({
    entries: [],
    moodEntries: [],
    ui: {
      reportPeriod: {
        start: '2026-04-01',
        end: '2026-04-30',
      },
    },
    setReportPeriod: vi.fn(),
  }),
}));

vi.mock('../../pain-tracker/WCBReport', () => ({
  WCBReportGenerator: () => <div>WCB Report Generator</div>,
}));

vi.mock('../../pain-tracker/WCBReportPreview', () => ({
  WCBReportPreview: () => <div>WCB Report Preview</div>,
}));

vi.mock('../../../config/features', () => ({
  isFeatureEnabled: () => true,
}));

const toastInfo = vi.fn();

vi.mock('../../feedback', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: toastInfo,
  }),
}));

function renderWithSubscription(userId: string, ui: React.ReactElement) {
  return render(<SubscriptionProvider userId={userId}>{ui}</SubscriptionProvider>);
}

describe('tier restriction UI exports', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    currentUserId = `ui-tier-user-${Math.random().toString(36).slice(2)}`;
  });

  it('shows the WCB panel as locked for Free users', async () => {
    renderWithSubscription(currentUserId, <WCBReportPanel entries={[]} />);

    await waitFor(() => {
      expect(screen.getByText(/insurance & wcb forms pack/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/this part of the app is clipped until you upgrade to basic/i)
    ).toBeInTheDocument();
  });

  it('shows the PDF export panel as clipped for Free users', async () => {
    renderWithSubscription(currentUserId, <GatedPDFReport userId={currentUserId} />);

    await waitFor(() => {
      expect(screen.getByText(/upgrade to basic to unlock this section/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/you are on free\. this part of the app is clipped until you upgrade to basic/i)
    ).toBeInTheDocument();
  });

  it('uses toast guidance instead of browser alerts for export workspace entry points', async () => {
    await subscriptionService.createSubscription(currentUserId, 'basic');

    renderWithSubscription(currentUserId, <GatedWCBReport userId={currentUserId} />);

    fireEvent.click(screen.getByRole('button', { name: /open reports & export/i }));

    await waitFor(() => {
      expect(toastInfo).toHaveBeenCalledWith(
        'Open Reports & Export',
        'WorkSafeBC report export stays in Reports & Export. Open the Reports page to generate it.'
      );
    });
  });
});
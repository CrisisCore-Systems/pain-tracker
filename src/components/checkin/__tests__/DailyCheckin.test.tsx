import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '../../../test/test-utils';
import DailyCheckin from '../DailyCheckin';
import { empathyIntelligenceEngine } from '../../../services/EmpathyIntelligenceEngine';
import type { QuantifiedEmpathyMetrics, EmpathyInsight } from '../../../types/quantified-empathy';

// Mock QuickLogStepper to simplify interactions
vi.mock('../../../design-system/fused-v2/QuickLogStepper', () => ({
  QuickLogStepper: (props: { onComplete: (data: { pain: number; locations: string[]; symptoms: string[]; notes: string }) => void; onCancel?: () => void }) => (
    <div>
      <button onClick={() => props.onComplete({ pain: 7, locations: [], symptoms: [], notes: 'test' })}>
        Mock Complete
      </button>
      <button onClick={() => props.onCancel?.()}>Mock Cancel</button>
    </div>
  ),
}));

// Spy on empathy engine methods
const fakeInsights: EmpathyInsight[] = [
  { id: 'i1', title: 'Top insight', description: 'Be gentle with yourself', confidence: 90, actionable: true, personalized: false, timestamp: new Date(), dataPoints: [], type: 'celebration' },
];

vi.spyOn(empathyIntelligenceEngine, 'calculateAdvancedEmpathyMetrics').mockImplementation(async () => {
  return {} as unknown as QuantifiedEmpathyMetrics;
});
vi.spyOn(empathyIntelligenceEngine, 'generateAdvancedInsights').mockImplementation(async () => {
  return fakeInsights;
});

describe('DailyCheckin', () => {
  it('saves entry and shows insights panel, then calls onDone when Done clicked', async () => {
    const onComplete = vi.fn();
    const onCancel = vi.fn();
    const onDone = vi.fn();

    render(
      <DailyCheckin onComplete={onComplete} onCancel={onCancel} onDone={onDone} entries={[]} />
    );

    // Click the mocked QuickLogStepper complete button
    fireEvent.click(screen.getByText('Mock Complete'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });

    // Dialog should appear with follow-up insights
    const dialog = await waitFor(() => screen.getByRole('dialog'));
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: /thoughtful follow-up/i })).toBeInTheDocument();
    expect(within(dialog).getAllByRole('listitem').length).toBeGreaterThan(0);

    // Click Done inside the dialog
    fireEvent.click(within(dialog).getByText('Done'));

    expect(onDone).toHaveBeenCalled();
  });
});

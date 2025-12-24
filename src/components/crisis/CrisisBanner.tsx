import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../design-system';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { detectCrisis } from '../../utils/pain-tracker/crisis';
import { trackCrisisDetected } from '../../services/AnalyticsTrackingService';
import { hipaaComplianceService } from '../../services/HIPAACompliance';
import CrisisModal from './CrisisModal';

export function CrisisBanner() {
  const entries = usePainTrackerStore(state => state.entries);
  const enabled = usePainTrackerStore((s) => (s as any).crisisDetectionEnabled ?? true);
  const [show, setShow] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const crisisConfig = useMemo(
    () => ({ lookbackDays: 7, thresholdRatio: 1.2, minAbsoluteIncrease: 2 }),
    []
  );
  const [lastResult, setLastResult] = useState<ReturnType<typeof detectCrisis> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const res = detectCrisis(entries as any, crisisConfig);
    if (res.detected) {
      setShow(true);
      setLastResult(res);
      // Analytics + coarse audit (no PHI)
      try { trackCrisisDetected('severe'); } catch (_) { /* noop */ }
      void hipaaComplianceService.logAuditEvent({
        actionType: 'alert',
        userId: 'local',
        userRole: 'self',
        resourceType: 'crisis_alert',
        resourceId: 'local',
        outcome: 'detected',
        details: { baseline: res.baseline, lastValue: res.lastValue },
      }).catch(() => {});
    } else {
      setShow(false);
      setShowWhy(false);
      setLastResult(null);
    }
  }, [entries, enabled, crisisConfig]);

  if (!show) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 flex items-center justify-center px-4">
      <div className="max-w-screen-2xl w-full">
        <div className="flex items-center justify-between gap-4 bg-red-600 text-white rounded-xl p-3 shadow-lg">
          <div>
            <strong>High pain alert</strong>
            <div className="text-sm opacity-90">We detected a recent, significant increase in pain.</div>
            {lastResult && (
              <div className="text-xs opacity-90 mt-1">
                Baseline (last {crisisConfig.lookbackDays} days avg): {lastResult.baseline} • Latest: {lastResult.lastValue}
                {typeof lastResult.diff === 'number'
                  ? ` • Change: ${lastResult.diff >= 0 ? '+' : ''}${lastResult.diff}`
                  : ''}
              </div>
            )}
            {showWhy && (
              <div className="text-xs opacity-90 mt-2 max-w-[70ch]">
                This alert is calculated locally from your recent entries.
                {lastResult?.baseline && lastResult.baseline > 0 ? (
                  <> We alert when the latest value is at least {crisisConfig.thresholdRatio}x your baseline and at least {crisisConfig.minAbsoluteIncrease} points higher.</>
                ) : (
                  <> If there isnt enough history to form a baseline, we require an absolute increase of at least {crisisConfig.minAbsoluteIncrease} points.</>
                )}
                {' '}This is a heads-up, not a diagnosis.
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-white"
              onClick={() => setShowWhy(v => !v)}
              aria-expanded={showWhy}
            >
              Why?
            </Button>
            <Button variant="ghost" className="text-white" onClick={() => setModalOpen(true)}>Get help</Button>
            <Button onClick={() => setShow(false)}>Dismiss</Button>
          </div>
        </div>
      </div>

      <CrisisModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default CrisisBanner;

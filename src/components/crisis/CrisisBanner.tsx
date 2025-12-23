import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!enabled) return;
    const res = detectCrisis(entries as any);
    if (res.detected) {
      setShow(true);
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
    }
  }, [entries, enabled]);

  if (!show) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 flex items-center justify-center px-4">
      <div className="max-w-screen-2xl w-full">
        <div className="flex items-center justify-between gap-4 bg-red-600 text-white rounded-xl p-3 shadow-lg">
          <div>
            <strong>High pain alert</strong>
            <div className="text-sm opacity-90">We detected a recent, significant increase in pain.</div>
          </div>
          <div className="flex gap-2">
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

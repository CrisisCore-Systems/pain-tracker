import React, { useState } from 'react';
import { Button, Card } from '../../design-system';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { hipaaComplianceService } from '../../services/HIPAACompliance';

export default function ClinicianPortal() {
  const [consented, setConsented] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const entries = usePainTrackerStore(s => s.entries);

  function handleConsent() {
    setConsented(true);
    void hipaaComplianceService.logAuditEvent({
      actionType: 'update',
      userId: 'local',
      userRole: 'self',
      resourceType: 'clinician_portal',
      resourceId: 'local',
      outcome: 'success',
      details: { consented: true },
    });
  }

  function handleRevoke() {
    setConsented(false);
    setExportUrl(null);
    void hipaaComplianceService.logAuditEvent({
      actionType: 'update',
      userId: 'local',
      userRole: 'self',
      resourceType: 'clinician_portal',
      resourceId: 'local',
      outcome: 'success',
      details: { consented: false },
    });
  }

  function handleExport() {
    // Export selected entries as JSON, generate a local-only share link
    const data = JSON.stringify({ entries });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    setExportUrl(url);
    void hipaaComplianceService.logAuditEvent({
      actionType: 'export',
      userId: 'local',
      userRole: 'self',
      resourceType: 'clinician_portal',
      resourceId: 'local',
      outcome: 'success',
      details: { entryCount: entries.length },
    });
  }

  return (
    <Card className="max-w-xl mx-auto mt-8 p-6">
      <h2 className="text-xl font-bold mb-2">Clinician Portal (Local Prototype)</h2>
      <p className="text-sm text-muted-foreground mb-4">
        This is a local-only, non-networked prototype. You can export selected data and share it manually with your clinician. No data leaves your device unless you choose to export and share it.
      </p>
      {!consented ? (
        <div className="space-y-3">
          <p className="text-sm">To enable sharing, please provide explicit consent. You can revoke this at any time.</p>
          <Button onClick={handleConsent}>I consent to local export</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={handleExport}>Export my data (JSON)</Button>
            <Button variant="ghost" onClick={handleRevoke}>Revoke consent</Button>
          </div>
          {exportUrl && (
            <div className="mt-3">
              <a href={exportUrl} download="pain-tracker-export.json" className="text-blue-600 underline">Download export file</a>
              <div className="text-xs text-muted-foreground mt-1">Share this file manually with your clinician. No data is uploaded or sent automatically.</div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
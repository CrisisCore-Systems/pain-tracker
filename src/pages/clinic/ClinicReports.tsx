import React from 'react';
// import { ClinicProtectedRoute } from '../../components/clinic/ClinicProtectedRoute';
import { ReportingSystem } from '../../components/reporting/ReportingSystem';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

export function ClinicReports() {
  const entries = usePainTrackerStore(state => state.entries);

  return (
    <div className="p-6">
      <ReportingSystem entries={entries} />
    </div>
  );
}

export default ClinicReports;

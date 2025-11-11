import React from 'react';
import type { PainEntry } from '../../types';
import { SavePanel } from '../pain-tracker/SavePanel';
import { FeatureGate, UsageWarning } from './FeatureGates';
import { checkExportQuota, trackExportUsage } from '../../stores/subscription-actions';

interface GatedSavePanelProps {
  entries: PainEntry[];
  userId: string;
  onClearData?: () => void;
}

/**
 * SavePanel with Feature Gates
 * - CSV Export: Available on all tiers
 * - JSON Export: Requires Basic tier or higher
 * - Enforces export quota limits
 */
export const GatedSavePanel: React.FC<GatedSavePanelProps> = ({ 
  entries, 
  userId,
  onClearData 
}) => {

  const handleExport = async (format: 'json' | 'csv') => {
    // Check quota before export
    const quotaCheck = await checkExportQuota(userId);
    
    if (!quotaCheck.success) {
      // Quota exceeded - upgrade prompt will be shown by SavePanel wrapper
      alert(quotaCheck.error || 'Export quota exceeded. Please upgrade your plan.');
      return;
    }

    // Perform export
    let data: string;
    let mimeType: string;
    let filename: string;

    if (format === 'json') {
      data = JSON.stringify(entries, null, 2);
      mimeType = 'application/json';
      filename = 'pain-tracker-export.json';
    } else {
      // CSV format
      const headers = [
        'Date',
        'Pain Level',
        'Locations',
        'Symptoms',
        'Limited Activities',
        'Medications',
        'Notes'
      ];

      const rows = entries.map(entry => {
        const medications = (entry.medications?.current ?? [])
          .map(med => `${med.name} ${med.dosage}`)
          .join(';');
        
        const rowData = [
          new Date(entry.timestamp).toISOString(),
          entry.baselineData.pain.toString(),
          Array.prototype.join.call(entry.baselineData.locations ?? [], ';'),
          Array.prototype.join.call(entry.baselineData.symptoms ?? [], ';'),
          Array.prototype.join.call(entry.functionalImpact?.limitedActivities ?? [], ';'),
          medications,
          `"${entry.notes || ''}"`
        ];
        return rowData;
      });

      data = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      mimeType = 'text/csv';
      filename = 'pain-tracker-export.csv';
    }

    // Download file
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Track usage after successful export
    await trackExportUsage(userId);
  };

  return (
    <div className="space-y-4">
      {/* Usage warning when approaching export limit */}
      <UsageWarning feature="maxExportsPerMonth" threshold={80} />
      
      {/* CSV Export - Available on all tiers */}
      <div>
        <SavePanel 
          entries={entries}
          onClearData={onClearData}
          onExport={(format) => {
            if (format === 'csv') {
              void handleExport('csv');
            }
          }}
        />
      </div>
    </div>
  );
};

interface GatedWCBReportProps {
  entries: PainEntry[];
  userId: string;
}

/**
 * WCB Report Export with Feature Gate
 * Requires Basic tier or higher for WCB reports
 */
export const GatedWCBReport: React.FC<GatedWCBReportProps> = ({ userId }) => {
  return (
    <FeatureGate feature="wcbReports" showUpgradePrompt>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">WorkSafe BC Report</h3>
        <p className="text-sm text-gray-600 mb-4">
          Generate a comprehensive report for your WorkSafe BC claim submission.
        </p>
        {/* WCB Report component would go here */}
        <button
          onClick={async () => {
            // Check export quota
            const quotaCheck = await checkExportQuota(userId);
            if (!quotaCheck.success) {
              alert(quotaCheck.error || 'Export quota exceeded.');
              return;
            }

            // Generate WCB report logic here
            alert('WCB report generation will be implemented here');

            // Track usage
            await trackExportUsage(userId);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate WCB Report
        </button>
      </div>
    </FeatureGate>
  );
};

/**
 * PDF Report Export with Feature Gate
 * Requires Basic tier or higher for PDF reports
 */
export const GatedPDFReport: React.FC<GatedWCBReportProps> = ({ userId }) => {
  return (
    <FeatureGate feature="pdfReports" showUpgradePrompt>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">PDF Report</h3>
        <p className="text-sm text-gray-600 mb-4">
          Export your pain tracking data as a professional PDF report.
        </p>
        <button
          onClick={async () => {
            // Check export quota
            const quotaCheck = await checkExportQuota(userId);
            if (!quotaCheck.success) {
              alert(quotaCheck.error || 'Export quota exceeded.');
              return;
            }

            // Generate PDF report logic here
            alert('PDF report generation will be implemented here');

            // Track usage
            await trackExportUsage(userId);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate PDF Report
        </button>
      </div>
    </FeatureGate>
  );
};

/**
 * Clinical PDF Export with Feature Gate
 * Requires Pro tier for HIPAA-compliant clinical exports
 */
export const GatedClinicalPDFExport: React.FC<GatedWCBReportProps> = ({ userId }) => {
  return (
    <FeatureGate feature="clinicalPDFExport" showUpgradePrompt>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Clinical PDF Export</h3>
        <p className="text-sm text-gray-600 mb-4">
          Generate HIPAA-compliant clinical reports for healthcare providers.
        </p>
        <div className="text-xs text-gray-500 mb-4">
          <p>✓ HIPAA Compliant</p>
          <p>✓ Clinical Formatting</p>
          <p>✓ Standardized Templates</p>
        </div>
        <button
          onClick={async () => {
            // Check export quota
            const quotaCheck = await checkExportQuota(userId);
            if (!quotaCheck.success) {
              alert(quotaCheck.error || 'Export quota exceeded.');
              return;
            }

            // Generate clinical PDF logic here
            alert('Clinical PDF export will be implemented here');

            // Track usage
            await trackExportUsage(userId);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate Clinical PDF
        </button>
      </div>
    </FeatureGate>
  );
};

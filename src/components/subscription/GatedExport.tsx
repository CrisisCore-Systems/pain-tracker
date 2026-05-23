import React from 'react';
import type { PainEntry } from '../../types';
import { SavePanel } from '../pain-tracker/SavePanel';
import { TierGate, UsageWarning } from './FeatureGates';
import { checkExportQuota, trackExportUsage } from '../../stores/subscription-actions';
import { entitlementService } from '../../services/EntitlementService';
import { UpgradeCard } from '../UpgradeCard';
import { useToast } from '../feedback';
import { buildExportLimitMessage, buildExportWorkspaceMessage } from '../export/exportCopy';

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
export const GatedSavePanel: React.FC<GatedSavePanelProps> = ({ entries, userId, onClearData }) => {
  const toast = useToast();

  const handleExport = async (format: 'json' | 'csv') => {
    // Check quota before export
    const quotaCheck = await checkExportQuota(userId);

    if (!quotaCheck.success) {
      toast.info(
        'Export Limit Reached',
        quotaCheck.error || buildExportLimitMessage(quotaCheck.upgradeRequired)
      );
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
        'Notes',
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
          `"${entry.notes || ''}"`,
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
    link.remove();
    URL.revokeObjectURL(url);

    // Track usage after successful export
    await trackExportUsage(userId);
  };

  return (
    <div className="space-y-4">
      {/* Export quota warning based on per-tier numeric limit (maxExportsPerMonth) */}
      <UsageWarning feature="maxExportsPerMonth" threshold={80} />

      {/* CSV Export - Available on all tiers */}
      <div>
        <SavePanel
          entries={entries}
          onClearData={onClearData}
          onExport={format => {
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
  userId: string;
}

/**
 * WCB Report Export with Feature Gate
 * Requires Basic tier or higher for WCB reports
 */
export const GatedWCBReport: React.FC<GatedWCBReportProps> = ({ userId }) => {
  const toast = useToast();

  if (!entitlementService.hasEntitlement('reports_wcb_forms')) {
    return <UpgradeCard moduleId="reports_wcb_forms" />;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">WorkSafe BC Report</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Generate a comprehensive report for your WorkSafe BC claim submission.
      </p>
      {/* WCB Report component would go here */}
      <button
        onClick={async () => {
          // Check export quota
          const quotaCheck = await checkExportQuota(userId);
          if (!quotaCheck.success) {
            toast.info(
              'Export Limit Reached',
              quotaCheck.error || buildExportLimitMessage(quotaCheck.upgradeRequired)
            );
            return;
          }

          toast.info(
            'Open Reports & Export',
            buildExportWorkspaceMessage('WorkSafeBC report export')
          );

          // Track usage
          await trackExportUsage(userId);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Open Reports & Export
      </button>
    </div>
  );
};

/**
 * PDF Report Export with Feature Gate
 * Requires Basic tier or higher for PDF reports
 */
export const GatedPDFReport: React.FC<GatedWCBReportProps> = ({ userId }) => {
  const toast = useToast();

  return (
    <TierGate requiredTier="basic" showUpgradePrompt>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">PDF Report</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Export your pain tracking data as a professional PDF report.
        </p>
        <button
          onClick={async () => {
            // Check export quota
            const quotaCheck = await checkExportQuota(userId);
            if (!quotaCheck.success) {
              toast.info(
                'Export Limit Reached',
                quotaCheck.error || buildExportLimitMessage(quotaCheck.upgradeRequired)
              );
              return;
            }

            toast.info('Open Reports & Export', buildExportWorkspaceMessage('PDF export'));

            // Track usage
            await trackExportUsage(userId);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Open Reports & Export
        </button>
      </div>
    </TierGate>
  );
};

/**
 * Clinical PDF Export with Feature Gate
 * Requires Pro tier for clinic-ready clinical exports
 */
export const GatedClinicalPDFExport: React.FC<GatedWCBReportProps> = ({ userId }) => {
  const toast = useToast();

  if (!entitlementService.hasEntitlement('reports_clinical_pdf')) {
    return <UpgradeCard moduleId="reports_clinical_pdf" />;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Clinical PDF Export</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Generate clinic-ready clinical reports for healthcare providers.
      </p>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        <p>✓ Privacy-aligned security controls</p>
        <p>✓ Clinical Formatting</p>
        <p>✓ Standardized Templates</p>
      </div>
      <button
        onClick={async () => {
          // Check export quota
          const quotaCheck = await checkExportQuota(userId);
          if (!quotaCheck.success) {
            toast.info(
              'Export Limit Reached',
              quotaCheck.error || buildExportLimitMessage(quotaCheck.upgradeRequired)
            );
            return;
          }

          toast.info(
            'Open Reports & Export',
            buildExportWorkspaceMessage('Clinical PDF export')
          );

          // Track usage
          await trackExportUsage(userId);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Open Reports & Export
      </button>
    </div>
  );
};

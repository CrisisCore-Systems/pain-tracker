import React, { useState, useCallback } from 'react';
import { FileText, Download } from 'lucide-react';
import { PatientClaimInfoModal, type PatientClaimInfo } from './PatientClaimInfoModal';
import { captureMultipleCharts, waitForChartsToRender } from '../../utils/chartCapture';
import type { PainEntry } from '../../types';
import type { MoodEntry } from '../../types/quantified-empathy';
import { hipaaComplianceService } from '../../services/HIPAACompliance';
import type { AuditTrail } from '../../services/HIPAACompliance';

type AuditActionType = AuditTrail['actionType'];
type AuditOutcome = AuditTrail['outcome'];

interface ClinicalPDFExportButtonProps {
  entries: PainEntry[];
  moodEntries?: MoodEntry[];
  className?: string;
  variant?: 'button' | 'compact';
}

/**
 * Clinical PDF Export Button with Patient Info Collection
 * 
 * Integrates patient info modal, chart capture, and PDF generation.
 * Provides user feedback during export process.
 */
export const ClinicalPDFExportButton: React.FC<ClinicalPDFExportButtonProps> = ({
  entries,
  moodEntries = [],
  className = '',
  variant = 'button',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logPdfAudit = useCallback(
    async ({
      action,
      actionType = 'export',
      outcome = 'success',
      details = {}
    }: {
      action: string;
      actionType?: AuditActionType;
      outcome?: AuditOutcome;
      details?: Record<string, unknown>;
    }) => {
      try {
        await hipaaComplianceService.logAuditEvent({
          actionType,
          userId: 'local-user',
          userRole: 'patient',
          resourceType: 'ClinicalPDFExport',
          outcome,
          details: {
            action,
            entryCount: entries.length,
            moodEntryCount: moodEntries.length,
            ...details
          }
        });
      } catch (auditError) {
        console.error('HIPAA audit logging failed', auditError);
      }
    },
    [entries.length, moodEntries.length]
  );

  const handleExportClick = () => {
    if (entries.length === 0) {
      setError('No pain entries to export');
      void logPdfAudit({
        action: 'clinical-pdf-export',
        outcome: 'failure',
        details: { reason: 'no-entries' }
      });
      return;
    }
    setError(null);
    setShowModal(true);
    void logPdfAudit({
      action: 'clinical-pdf-export',
      actionType: 'access',
      details: { step: 'patient-info-modal' }
    });
  };

  const handleSubmitPatientInfo = async (patientInfo: PatientClaimInfo) => {
    setIsExporting(true);
    setError(null);
    void logPdfAudit({
      action: 'clinical-pdf-export',
      details: {
        stage: 'generation-start',
        hasPatientInfo: Boolean(patientInfo)
      }
    });

    try {
      // Wait for charts to render
      await waitForChartsToRender(1000);

      // Capture chart images
      const chartImages = await captureMultipleCharts([
        { id: 'pain-trend-chart', type: 'canvas' },
        { id: 'pain-distribution-chart', type: 'canvas' },
      ]);

      // Lazy load PDF exporter to defer jsPDF bundle loading (Phase 3 optimization)
      const { ClinicalPDFExporter } = await import('../../services/ClinicalPDFExporter');
      const exporter = new ClinicalPDFExporter();
      await exporter.generateReport({
        entries,
        patientInfo,
        moodEntries,
        charts: {
          painTrend: chartImages['pain-trend-chart'],
          painDistribution: chartImages['pain-distribution-chart'],
        },
        includeNarrative: true,
      });

      // Success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      await logPdfAudit({
        action: 'clinical-pdf-export',
        details: {
          stage: 'generation-complete',
          chartsCaptured: Object.keys(chartImages).length
        }
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Failed to generate PDF. Please try again.');
      await logPdfAudit({
        action: 'clinical-pdf-export',
        outcome: 'failure',
        details: {
          stage: 'generation-error',
          error: err instanceof Error ? err.message : 'unknown-error'
        }
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleExportClick}
          disabled={isExporting || entries.length === 0}
          className={`inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium ${className}`}
          aria-label="Export clinical PDF report"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Exporting...
            </>
          ) : (
            <>
              <FileText size={16} />
              Export PDF
            </>
          )}
        </button>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2" role="alert">
            {error}
          </p>
        )}

        <PatientClaimInfoModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitPatientInfo}
        />
      </>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleExportClick}
        disabled={isExporting || entries.length === 0}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium text-lg"
        aria-label="Export clinical PDF report"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            <span>Generating PDF Report...</span>
          </>
        ) : (
          <>
            <Download size={24} />
            <span>Export Clinical PDF Report</span>
          </>
        )}
      </button>

      {error && (
        <div
          className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          role="alert"
        >
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {entries.length === 0 && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Start tracking your pain to generate clinical reports
        </p>
      )}

      <PatientClaimInfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitPatientInfo}
      />
    </div>
  );
};

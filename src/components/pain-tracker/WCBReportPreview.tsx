import React, { useState } from 'react';
import type { WCBReport } from '../../types';
import { generateWCBReportPDF } from '../../utils/pdf-generator';
import { submitToWCB, getSubmissionStatus } from '../../services/wcb-submission';

interface WCBReportPreviewProps {
  report: WCBReport;
}

export function WCBReportPreview({ report }: WCBReportPreviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    status?: 'pending' | 'approved' | 'rejected' | 'requires_changes';
    message?: string;
    submissionId?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      await generateWCBReportPDF(report);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitToWCB(report);

      if (result.success && result.submissionId) {
        setSubmissionStatus({
          status: 'pending',
          submissionId: result.submissionId,
        });

        // Start polling for status
        pollSubmissionStatus(result.submissionId);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollSubmissionStatus = async (submissionId: string) => {
    try {
      const status = await getSubmissionStatus(submissionId);
      setSubmissionStatus(prev => ({
        ...prev,
        ...status,
      }));

      // Continue polling if pending
      if (status.status === 'pending') {
        setTimeout(() => pollSubmissionStatus(submissionId), 5000);
      }
    } catch (error) {
      console.error('Status check error:', error);
      setError('Failed to check submission status');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">WCB Report Preview</h2>
        <div className="space-x-4">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Download PDF
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isSubmitting || submissionStatus.status === 'approved'}
          >
            {isSubmitting ? 'Submitting...' : 'Submit to WCB'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
      )}

      {submissionStatus.status && (
        <div className={`mb-6 p-4 rounded ${getStatusStyles(submissionStatus.status)}`}>
          <div className="font-medium">Status: {formatStatus(submissionStatus.status)}</div>
          {submissionStatus.message && (
            <div className="mt-2 text-sm">{submissionStatus.message}</div>
          )}
        </div>
      )}

      {/* Claim Information */}
      {report.claimInfo && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Claim Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Claim Number</p>
              <p className="font-medium">{report.claimInfo.claimNumber || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Injury Date</p>
              <p className="font-medium">
                {new Date(report.claimInfo.injuryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Pain Trends */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Pain Analysis</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p className="mb-2">
            <span className="font-medium">Average Pain Level:</span> {report.painTrends.average}/10
          </p>
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Most Affected Areas:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(report.painTrends.locations)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([location, frequency]) => (
                  <span
                    key={location}
                    className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                  >
                    {location} ({frequency}x)
                  </span>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Work Impact */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Work Impact</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p className="mb-4">
            <span className="font-medium">Missed Work Days:</span> {report.workImpact.missedDays}
          </p>

          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Work Limitations:</h4>
            <ul className="list-disc list-inside">
              {report.workImpact.limitations.map(([limitation]) => (
                <li key={limitation} className="text-gray-700">
                  {limitation}
                </li>
              ))}
            </ul>
          </div>

          {report.workImpact.accommodationsNeeded.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Required Accommodations:</h4>
              <ul className="list-disc list-inside">
                {report.workImpact.accommodationsNeeded.map(accommodation => (
                  <li key={accommodation} className="text-gray-700">
                    {accommodation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Treatment Progress */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Treatment Progress</h3>
        <div className="bg-gray-50 p-4 rounded">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Current Treatments:</h4>
            <ul className="list-disc list-inside">
              {report.treatments.current.map(({ treatment, frequency }) => (
                <li key={treatment} className="text-gray-700">
                  {treatment} ({frequency} sessions)
                </li>
              ))}
            </ul>
          </div>
          <p>
            <span className="font-medium">Overall Effectiveness:</span>{' '}
            {report.treatments.effectiveness}
          </p>
        </div>
      </section>

      {/* Recommendations */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
        <div className="bg-gray-50 p-4 rounded">
          <ul className="list-disc list-inside">
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700 mb-2">
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function getStatusStyles(status: string): string {
  switch (status) {
    case 'approved':
      return 'bg-green-50 border border-green-200 text-green-700';
    case 'rejected':
      return 'bg-red-50 border border-red-200 text-red-700';
    case 'requires_changes':
      return 'bg-yellow-50 border border-yellow-200 text-yellow-700';
    default:
      return 'bg-blue-50 border border-blue-200 text-blue-700';
  }
}

function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

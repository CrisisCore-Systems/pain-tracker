import React from 'react';
import type { WCBReport } from '../../types';
import { generateWCBReportPDF } from '../../utils/pdf-generator';

interface WCBReportPreviewProps {
  report: WCBReport;
  onSubmit?: () => void;
}

export function WCBReportPreview({ report, onSubmit }: WCBReportPreviewProps) {
  const handleDownload = async () => {
    try {
      await generateWCBReportPDF(report);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Here you could add a toast notification or other error feedback
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
          >
            Download PDF
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit to WCB
            </button>
          )}
        </div>
      </div>

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
              <p className="font-medium">{new Date(report.claimInfo.injuryDate).toLocaleDateString()}</p>
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
                .sort(([,a], [,b]) => b - a)
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
                <li key={limitation} className="text-gray-700">{limitation}</li>
              ))}
            </ul>
          </div>

          {report.workImpact.accommodationsNeeded.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Required Accommodations:</h4>
              <ul className="list-disc list-inside">
                {report.workImpact.accommodationsNeeded.map((accommodation) => (
                  <li key={accommodation} className="text-gray-700">{accommodation}</li>
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
              <li key={index} className="text-gray-700 mb-2">{recommendation}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
} 
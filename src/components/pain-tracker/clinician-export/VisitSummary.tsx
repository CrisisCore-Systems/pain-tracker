import React from 'react';
import { format } from 'date-fns';
import type { PainEntry } from '../../../types';

interface VisitSummaryProps {
  entries: PainEntry[];
  dateRange?: {
    start: string;
    end: string;
  };
  patientInfo?: {
    name?: string;
    dateOfBirth?: string;
    healthcareNumber?: string;
    physicianName?: string;
    clinicName?: string;
  };
}

export const VisitSummary: React.FC<VisitSummaryProps> = ({ 
  entries, 
  dateRange,
  patientInfo 
}) => {
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const latestEntry = sortedEntries[0];
  const avgPain = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / entries.length
    : 0;

  const locationFrequency = entries.reduce((acc, entry) => {
    entry.baselineData.locations.forEach(location => {
      acc[location] = (acc[location] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topLocations = Object.entries(locationFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));

  const currentMedications = latestEntry?.medications.current || [];
  const recentTreatments = entries
    .flatMap(entry => entry.treatments.recent)
    .filter((treatment, index, arr) => 
      arr.findIndex(t => t.type === treatment.type) === index
    )
    .slice(0, 5);

  const functionalLimitations = latestEntry?.functionalImpact.limitedActivities || [];
  const workImpact = entries.reduce((sum, entry) => sum + entry.workImpact.missedWork, 0);

  const printSummary = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      <div className="p-8 print:p-6">
        {/* Header */}
        <div className="border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pain Management Visit Summary
              </h1>
              <p className="text-gray-600 mt-1">
                Generated on {format(new Date(), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="text-right">
              {patientInfo?.clinicName && (
                <div className="font-semibold">{patientInfo.clinicName}</div>
              )}
              {patientInfo?.physicianName && (
                <div className="text-gray-600">{patientInfo.physicianName}</div>
              )}
            </div>
          </div>
        </div>

        {/* Patient Information */}
        {patientInfo && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {patientInfo.name && (
                <div>
                  <span className="font-medium">Name:</span> {patientInfo.name}
                </div>
              )}
              {patientInfo.dateOfBirth && (
                <div>
                  <span className="font-medium">Date of Birth:</span> {patientInfo.dateOfBirth}
                </div>
              )}
              {patientInfo.healthcareNumber && (
                <div>
                  <span className="font-medium">Healthcare Number:</span> {patientInfo.healthcareNumber}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Report Period */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Report Period</h2>
          <div className="text-sm">
            {dateRange ? (
              <p>
                <span className="font-medium">Period:</span> {format(new Date(dateRange.start), 'MMMM d, yyyy')} - {format(new Date(dateRange.end), 'MMMM d, yyyy')}
              </p>
            ) : entries.length > 0 ? (
              <p>
                <span className="font-medium">Period:</span> {format(new Date(entries[entries.length - 1].timestamp), 'MMMM d, yyyy')} - {format(new Date(entries[0].timestamp), 'MMMM d, yyyy')}
              </p>
            ) : (
              <p>No data available</p>
            )}
            <p className="mt-1">
              <span className="font-medium">Total Entries:</span> {entries.length}
            </p>
          </div>
        </div>

        {/* Pain Overview */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Pain Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Average Pain Level</div>
              <div className="text-xl font-bold">{avgPain.toFixed(1)}/10</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Current Pain Level</div>
              <div className="text-xl font-bold">{latestEntry?.baselineData.pain || 'N/A'}/10</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Missed Work Days</div>
              <div className="text-xl font-bold">{workImpact}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Areas Affected</div>
              <div className="text-xl font-bold">{topLocations.length}</div>
            </div>
          </div>
        </div>

        {/* Most Affected Areas */}
        {topLocations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Most Affected Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topLocations.map((item) => (
                <div key={item.location} className="flex justify-between py-2 border-b">
                  <span>{item.location}</span>
                  <span className="font-medium">{item.count} entries</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Medications */}
        {currentMedications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Current Medications</h2>
            <div className="space-y-2">
              {currentMedications.map((med, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="font-medium">{med.name}</div>
                  <div className="text-sm text-gray-600">
                    {med.dosage} - {med.frequency}
                  </div>
                  <div className="text-sm text-gray-600">
                    Effectiveness: {med.effectiveness}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Treatments */}
        {recentTreatments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Recent Treatments</h2>
            <div className="space-y-2">
              {recentTreatments.map((treatment, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="font-medium">{treatment.type}</div>
                  <div className="text-sm text-gray-600">
                    Provider: {treatment.provider}
                  </div>
                  <div className="text-sm text-gray-600">
                    Date: {format(new Date(treatment.date), 'MMM d, yyyy')}
                  </div>
                  <div className="text-sm text-gray-600">
                    Effectiveness: {treatment.effectiveness}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Functional Limitations */}
        {functionalLimitations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Current Functional Limitations</h2>
            <ul className="list-disc list-inside space-y-1">
              {functionalLimitations.map((limitation, index) => (
                <li key={index} className="text-sm">{limitation}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Quality of Life Assessment */}
        {latestEntry && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Quality of Life Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Sleep Quality</div>
                <div className="text-lg font-bold">{latestEntry.qualityOfLife.sleepQuality}/10</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Mood Impact</div>
                <div className="text-lg font-bold">{latestEntry.qualityOfLife.moodImpact}/10</div>
              </div>
            </div>
            {latestEntry.qualityOfLife.socialImpact.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium">Social Impact:</div>
                <ul className="list-disc list-inside text-sm mt-1">
                  {latestEntry.qualityOfLife.socialImpact.map((impact, index) => (
                    <li key={index}>{impact}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Clinical Notes */}
        {latestEntry?.notes && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Latest Clinical Notes</h2>
            <div className="border rounded p-3 bg-gray-50">
              <p className="text-sm whitespace-pre-line">{latestEntry.notes}</p>
            </div>
          </div>
        )}

        {/* Print Button */}
        <div className="print:hidden mt-8 pt-6 border-t">
          <button
            onClick={printSummary}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Print Summary
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 1in;
            size: letter;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

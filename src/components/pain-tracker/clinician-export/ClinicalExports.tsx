import React, { useState } from 'react';
import { format } from 'date-fns';
import type { PainEntry } from '../../../types';
import { downloadData } from '../../../utils/pain-tracker/export';

interface ClinicalExportsProps {
  entries: PainEntry[];
}

export const ClinicalExports: React.FC<ClinicalExportsProps> = ({ entries }) => {
  const [exportFormat, setExportFormat] = useState<'standard' | 'detailed' | 'summary'>('standard');

  const generateClinicalCSV = (format: 'standard' | 'detailed' | 'summary'): string => {
    if (format === 'summary') {
      // Summary format for quick overview
      const avgPain = entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / entries.length
        : 0;

      const locationFreq = entries.reduce((acc, entry) => {
        entry.baselineData.locations.forEach(loc => {
          acc[loc] = (acc[loc] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      const topLocation = Object.entries(locationFreq)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

      const workDays = entries.reduce((sum, entry) => sum + entry.workImpact.missedWork, 0);
      const latestEntry = entries[0];

      const summaryData = [
        ['Report Generated', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
        ['Total Entries', entries.length.toString()],
        ['Average Pain Level', avgPain.toFixed(1)],
        ['Current Pain Level', latestEntry?.baselineData.pain.toString() || 'N/A'],
        ['Most Affected Area', topLocation],
        ['Total Missed Work Days', workDays.toString()],
        ['Current Sleep Quality', latestEntry?.qualityOfLife.sleepQuality.toString() || 'N/A'],
        ['Current Mood Impact', latestEntry?.qualityOfLife.moodImpact.toString() || 'N/A'],
        ['Current Medications', latestEntry?.medications.current.map(m => `${m.name} (${m.dosage})`).join('; ') || 'None'],
        ['Recent Treatments', latestEntry?.treatments.recent.map(t => `${t.type} - ${t.provider}`).join('; ') || 'None']
      ];

      return ['Field,Value', ...summaryData.map(([field, value]) => `"${field}","${value}"`)].join('\n');
    }

    if (format === 'detailed') {
      // Detailed format for comprehensive analysis
      const headers = [
        'Date', 'Time', 'Pain Level', 'Locations', 'Symptoms',
        'Limited Activities', 'Assistance Needed', 'Mobility Aids',
        'Current Medications', 'Medication Changes', 'Medication Effectiveness',
        'Recent Treatments', 'Treatment Effectiveness', 'Planned Treatments',
        'Sleep Quality', 'Mood Impact', 'Social Impact',
        'Missed Work Days', 'Modified Duties', 'Work Limitations',
        'Worsening Since', 'New Limitations', 'Clinical Notes'
      ].join(',');

      const rows = entries.map(entry => {
        const date = new Date(entry.timestamp);
        return [
          format(date, 'yyyy-MM-dd'),
          format(date, 'HH:mm'),
          entry.baselineData.pain,
          `"${entry.baselineData.locations.join('; ')}"`,
          `"${entry.baselineData.symptoms.join('; ')}"`,
          `"${entry.functionalImpact.limitedActivities.join('; ')}"`,
          `"${entry.functionalImpact.assistanceNeeded.join('; ')}"`,
          `"${entry.functionalImpact.mobilityAids.join('; ')}"`,
          `"${entry.medications.current.map(m => `${m.name} ${m.dosage} ${m.frequency}`).join('; ')}"`,
          `"${entry.medications.changes || ''}"`,
          `"${entry.medications.effectiveness || ''}"`,
          `"${entry.treatments.recent.map(t => `${t.type} (${t.provider}) - ${t.effectiveness}`).join('; ')}"`,
          `"${entry.treatments.effectiveness || ''}"`,
          `"${entry.treatments.planned.join('; ')}"`,
          entry.qualityOfLife.sleepQuality,
          entry.qualityOfLife.moodImpact,
          `"${entry.qualityOfLife.socialImpact.join('; ')}"`,
          entry.workImpact.missedWork,
          `"${entry.workImpact.modifiedDuties.join('; ')}"`,
          `"${entry.workImpact.workLimitations.join('; ')}"`,
          `"${entry.comparison.worseningSince || ''}"`,
          `"${entry.comparison.newLimitations.join('; ')}"`,
          `"${entry.notes.replace(/"/g, '""')}"`
        ].join(',');
      });

      return [headers, ...rows].join('\n');
    }

    // Standard format - same as existing export but with clinical focus
    const headers = [
      'Date', 'Time', 'Pain Level', 'Primary Location', 'Symptoms',
      'Sleep Quality', 'Mood Impact', 'Missed Work Days',
      'Current Medications', 'Recent Treatments', 'Notes'
    ].join(',');

    const rows = entries.map(entry => {
      const date = new Date(entry.timestamp);
      return [
        format(date, 'yyyy-MM-dd'),
        format(date, 'HH:mm'),
        entry.baselineData.pain,
        `"${entry.baselineData.locations[0] || ''}"`,
        `"${entry.baselineData.symptoms.slice(0, 3).join('; ')}"`,
        entry.qualityOfLife.sleepQuality,
        entry.qualityOfLife.moodImpact,
        entry.workImpact.missedWork,
        `"${entry.medications.current.map(m => m.name).join('; ')}"`,
        `"${entry.treatments.recent.map(t => t.type).join('; ')}"`,
        `"${entry.notes.replace(/"/g, '""').substring(0, 100)}${entry.notes.length > 100 ? '...' : ''}"`
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  };

  const generateClinicalJSON = (format: 'standard' | 'detailed' | 'summary'): string => {
    const metadata = {
      exportDate: new Date().toISOString(),
      format,
      totalEntries: entries.length,
      dateRange: entries.length > 0 ? {
        start: entries[entries.length - 1].timestamp,
        end: entries[0].timestamp
      } : null
    };

    if (format === 'summary') {
      const avgPain = entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / entries.length
        : 0;

      const locationStats = entries.reduce((acc, entry) => {
        entry.baselineData.locations.forEach(location => {
          if (!acc[location]) acc[location] = { count: 0, totalPain: 0 };
          acc[location].count++;
          acc[location].totalPain += entry.baselineData.pain;
        });
        return acc;
      }, {} as Record<string, { count: number; totalPain: number }>);

      const processedLocationStats = Object.entries(locationStats).map(([location, stats]) => ({
        location,
        frequency: stats.count,
        averagePain: Number((stats.totalPain / stats.count).toFixed(1))
      })).sort((a, b) => b.frequency - a.frequency);

      const latestEntry = entries[0];
      const workImpact = entries.reduce((sum, entry) => sum + entry.workImpact.missedWork, 0);

      return JSON.stringify({
        metadata,
        summary: {
          averagePainLevel: Number(avgPain.toFixed(1)),
          currentPainLevel: latestEntry?.baselineData.pain || null,
          totalMissedWorkDays: workImpact,
          locationStatistics: processedLocationStats,
          currentMedications: latestEntry?.medications.current || [],
          recentTreatments: latestEntry?.treatments.recent || [],
          qualityOfLife: latestEntry ? {
            sleepQuality: latestEntry.qualityOfLife.sleepQuality,
            moodImpact: latestEntry.qualityOfLife.moodImpact,
            socialImpact: latestEntry.qualityOfLife.socialImpact
          } : null,
          functionalLimitations: latestEntry?.functionalImpact.limitedActivities || []
        }
      }, null, 2);
    }

    if (format === 'detailed') {
      return JSON.stringify({
        metadata,
        entries: entries.map(entry => ({
          ...entry,
          timestamp: entry.timestamp,
          clinicalAnalysis: {
            painTrend: null, // Could be calculated based on previous entries
            medicationCompliance: null,
            treatmentResponse: null,
            functionalDecline: null
          }
        }))
      }, null, 2);
    }

    // Standard format
    return JSON.stringify({
      metadata,
      entries: entries.map(entry => ({
        date: entry.timestamp,
        painLevel: entry.baselineData.pain,
        primaryLocation: entry.baselineData.locations[0] || null,
        symptoms: entry.baselineData.symptoms,
        qualityOfLife: {
          sleep: entry.qualityOfLife.sleepQuality,
          mood: entry.qualityOfLife.moodImpact
        },
        medications: entry.medications.current.map(m => ({
          name: m.name,
          dosage: m.dosage,
          effectiveness: m.effectiveness
        })),
        treatments: entry.treatments.recent.map(t => ({
          type: t.type,
          provider: t.provider,
          effectiveness: t.effectiveness
        })),
        workImpact: {
          missedDays: entry.workImpact.missedWork,
          limitations: entry.workImpact.workLimitations
        },
        notes: entry.notes
      }))
    }, null, 2);
  };

  const handleExport = (format: 'csv' | 'json') => {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    const formatSuffix = exportFormat === 'standard' ? '' : `-${exportFormat}`;
    
    if (format === 'csv') {
      const csvData = generateClinicalCSV(exportFormat);
      downloadData(csvData, `clinical-export${formatSuffix}-${timestamp}.csv`);
    } else {
      const jsonData = generateClinicalJSON(exportFormat);
      downloadData(jsonData, `clinical-export${formatSuffix}-${timestamp}.json`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Clinical Data Export</h2>
      
      {entries.length === 0 ? (
        <p className="text-gray-600">No data available for export.</p>
      ) : (
        <div className="space-y-6">
          {/* Export Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'standard' | 'detailed' | 'summary')}
              className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
            >
              <option value="standard">Standard Clinical Export</option>
              <option value="detailed">Detailed Comprehensive Export</option>
              <option value="summary">Executive Summary Export</option>
            </select>
            <p className="text-sm text-gray-600 mt-1">
              {exportFormat === 'standard' && 'Essential clinical data for routine review'}
              {exportFormat === 'detailed' && 'Complete dataset for comprehensive analysis'}
              {exportFormat === 'summary' && 'High-level overview for quick assessment'}
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <span>📊</span>
              Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <span>📋</span>
              Export JSON
            </button>
          </div>

          {/* Export Preview */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Export Preview</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Total entries: {entries.length}</div>
              <div>Date range: {format(new Date(entries[entries.length - 1]?.timestamp || new Date()), 'MMM d, yyyy')} - {format(new Date(entries[0]?.timestamp || new Date()), 'MMM d, yyyy')}</div>
              <div>
                Fields included: {
                  exportFormat === 'summary' ? '10 summary fields' :
                  exportFormat === 'detailed' ? '23 comprehensive fields' :
                  '11 standard fields'
                }
              </div>
            </div>
          </div>

          {/* Clinical Data Summary */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-3">Quick Clinical Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Avg Pain</div>
                <div className="font-bold">
                  {entries.length > 0 
                    ? (entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / entries.length).toFixed(1)
                    : 'N/A'}/10
                </div>
              </div>
              <div>
                <div className="text-gray-600">Unique Locations</div>
                <div className="font-bold">
                  {new Set(entries.flatMap(e => e.baselineData.locations)).size}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Work Days Lost</div>
                <div className="font-bold">
                  {entries.reduce((sum, entry) => sum + entry.workImpact.missedWork, 0)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Treatment Types</div>
                <div className="font-bold">
                  {new Set(entries.flatMap(e => e.treatments.recent.map(t => t.type))).size}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

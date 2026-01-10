import type { PainEntry } from '../../types';
// import jsPDF from 'jspdf'; // Moved to dynamic import
import { formatNumber } from '../formatting';
import { privacyAnalytics } from '../../services/PrivacyAnalyticsService';
import { trackDataExported } from '../../analytics/ga4-events';
import { trackExport } from '../usage-tracking';
import { analyticsLogger } from '../../lib/debug-logger';
import { FhirMapper } from '../../services/clinical/FhirMapper';
import type { Fhir } from '../../types/fhir';

export const exportToCSV = (entries: PainEntry[]): string => {
  // Track export analytics
  privacyAnalytics.trackDataExport('csv').catch((error) => {
    analyticsLogger.swallowed(error, { context: 'exportToCSV', exportType: 'csv' });
  });

  // Track GA4 custom event
  trackDataExported('csv', entries.length);
  
  // Track local usage
  trackExport('csv', entries.length);

  const headers = [
    'Date',
    'Time',
    'Pain Level',
    'Locations',
    'Symptoms',
    'Limited Activities',
    'Sleep Quality',
    'Mood Impact',
    'Missed Work Days',
    'Notes',
  ].join(',');

  const rows = entries.map(entry => {
    // Use the original ISO timestamp to avoid timezone differences
    const [isoDate, isoTimeWithZone] = entry.timestamp.split('T');
    const time = (isoTimeWithZone || '').slice(0, 5); // HH:mm from HH:mm:ssZ
    return [
      isoDate,
      time,
      entry.baselineData.pain,
      `"${entry.baselineData.locations?.join('; ') || ''}"`,
      `"${entry.baselineData.symptoms?.join('; ') || ''}"`,
      `"${entry.functionalImpact?.limitedActivities?.join('; ') || ''}"`,
      entry.qualityOfLife?.sleepQuality || '',
      entry.qualityOfLife?.moodImpact || '',
      entry.workImpact?.missedWork || '',
      `"${entry.notes?.replace(/"/g, '""') || ''}"`,
    ].join(',');
  });

  return [headers, ...rows].join('\\n');
};

export const exportToJSON = (entries: PainEntry[]): string => {
  // Track export analytics
  privacyAnalytics.trackDataExport('json').catch((error) => {
    analyticsLogger.swallowed(error, { context: 'exportToJSON', exportType: 'json' });
  });

  // Track GA4 custom event
  trackDataExported('json', entries.length);
  
  // Track local usage
  trackExport('json', entries.length);

  return JSON.stringify(entries, null, 2);
};

export const exportToFHIR = (entries: PainEntry[], patientId: string = 'patient-001'): string => {
  // Track export analytics
  privacyAnalytics.trackDataExport('fhir').catch((error) => {
    analyticsLogger.swallowed(error, { context: 'exportToFHIR', exportType: 'fhir' });
  });

  // Track GA4 custom event
  trackDataExported('fhir', entries.length);
  
  // Track local usage
  trackExport('fhir', entries.length);

  const bundles = entries.map(entry => FhirMapper.toGenericBundle(entry, patientId));
  
  // Flatten entries from all bundles into one collection bundle
  const allResources = bundles.flatMap(b => b.entry || []);

  const collectionBundle: Fhir.Bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: allResources
  };

  return JSON.stringify(collectionBundle, null, 2);
};

export const downloadData = (
  data: string,
  filename: string,
  mimeType: string = 'text/plain;charset=utf-8'
): void => {
  if (typeof window === 'undefined') return;

  let blob: Blob;
  if (data.startsWith('data:')) {
    // Handle data URIs (like PDFs from jsPDF)
    const [mime, base64Data] = data.split(',');
    blob = new Blob([atob(base64Data)], { type: mime.split(':')[1].split(';')[0] });
  } else {
    blob = new Blob([data], { type: mimeType });
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = async (entries: PainEntry[]): Promise<string> => {
  // Track export analytics
  privacyAnalytics.trackDataExport('pdf').catch((error) => {
    analyticsLogger.swallowed(error, { context: 'exportToPDF', exportType: 'pdf' });
  });

  // Track GA4 custom event
  trackDataExported('pdf', entries.length);
  
  // Track local usage
  trackExport('pdf', entries.length);

  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('Pain Tracking Report', 20, 30);

  // Date range
  doc.setFontSize(12);
  const startDate =
    entries.length > 0 ? new Date(entries[0].timestamp).toLocaleDateString() : 'N/A';
  const endDate =
    entries.length > 0
      ? new Date(entries[entries.length - 1].timestamp).toLocaleDateString()
      : 'N/A';
  doc.text(`Report Period: ${startDate} to ${endDate}`, 20, 45);

  // Summary statistics
  doc.text(`Total Entries: ${entries.length}`, 20, 55);

  if (entries.length > 0) {
    const avgPain =
      entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / entries.length;
    doc.text(`Average Pain Level: ${formatNumber(avgPain, 1)}/10`, 20, 65);

    const mostCommonSymptoms = getMostCommonItems(
      entries.flatMap(entry => entry.baselineData.symptoms || [])
    );
    const mostCommonLocations = getMostCommonItems(
      entries.flatMap(entry => entry.baselineData.locations || [])
    );

    doc.text(`Most Common Symptoms: ${mostCommonSymptoms.slice(0, 3).join(', ')}`, 20, 75);
    doc.text(`Most Common Locations: ${mostCommonLocations.slice(0, 3).join(', ')}`, 20, 85);
  }

  // Detailed entries
  let yPosition = 105;
  doc.setFontSize(14);
  doc.text('Detailed Entries', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(10);
  entries.slice(0, 20).forEach((entry, index) => {
    // Limit to first 20 entries for PDF
    if (yPosition > 270) {
      // Start new page if needed
      doc.addPage();
      yPosition = 30;
    }

    const date = new Date(entry.timestamp).toLocaleDateString();
    const time = new Date(entry.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    doc.text(`${index + 1}. ${date} ${time} - Pain: ${entry.baselineData.pain}/10`, 20, yPosition);
    yPosition += 8;

    if (entry.baselineData.symptoms && entry.baselineData.symptoms.length > 0) {
      doc.text(`   Symptoms: ${entry.baselineData.symptoms.join(', ')}`, 25, yPosition);
      yPosition += 8;
    }

    if (entry.baselineData.locations && entry.baselineData.locations.length > 0) {
      doc.text(`   Locations: ${entry.baselineData.locations.join(', ')}`, 25, yPosition);
      yPosition += 8;
    }

    if (entry.notes) {
      const noteLines = doc.splitTextToSize(`   Notes: ${entry.notes}`, 150);
      doc.text(noteLines, 25, yPosition);
      yPosition += noteLines.length * 5 + 5;
    }

    yPosition += 5; // Extra space between entries
  });

  if (entries.length > 20) {
    doc.text(`... and ${entries.length - 20} more entries`, 20, yPosition);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
      20,
      285
    );
  }

  return doc.output('datauristring');
};

const getMostCommonItems = (items: string[]): string[] => {
  const count: Record<string, number> = {};
  items.forEach(item => {
    count[item] = (count[item] || 0) + 1;
  });

  return Object.entries(count)
    .sort(([, a], [, b]) => b - a)
    .map(([item]) => item);
};

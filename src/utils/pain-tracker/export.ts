import type { PainEntry } from '../../types';

export const exportToCSV = (entries: PainEntry[]): string => {
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
    'Notes'
  ].join(',');

  const rows = entries.map(entry => {
    // Use the original ISO timestamp to avoid timezone differences
    const [isoDate, isoTimeWithZone] = entry.timestamp.split('T');
    const time = (isoTimeWithZone || '').slice(0, 5); // HH:mm from HH:mm:ssZ
    return [
      isoDate,
      time,
      entry.baselineData.pain,
      `"${entry.baselineData.locations.join('; ')}"`,
      `"${entry.baselineData.symptoms.join('; ')}"`,
      `"${entry.functionalImpact.limitedActivities.join('; ')}"`,
      entry.qualityOfLife.sleepQuality,
      entry.qualityOfLife.moodImpact,
      entry.workImpact.missedWork,
      `"${entry.notes.replace(/"/g, '""')}"`
    ].join(',');
  });

  return [headers, ...rows].join('\\n');
};

export const exportToJSON = (entries: PainEntry[]): string => {
  return JSON.stringify(entries, null, 2);
};

export const downloadData = (data: string, filename: string): void => {
  if (typeof window === 'undefined') return;
  
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}; 
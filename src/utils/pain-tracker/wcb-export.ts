import type { PainEntry } from '../../types';
import type { jsPDF } from 'jspdf';
import { formatNumber } from '../formatting';
import { privacyAnalytics } from '../../services/PrivacyAnalyticsService';
import { trackDataExported } from '../../analytics/ga4-events';
import { trackExport } from '../usage-tracking';
import { analyticsLogger } from '../../lib/debug-logger';

/**
 * Enhanced WorkSafe BC PDF Export
 * 
 * Generates professional, comprehensive PDF reports aligned with
 * WorkSafe BC Form 8 requirements for claims documentation.
 * 
 * Features:
 * - Professional header with patient information (optional)
 * - Executive summary with key metrics
 * - Pain trend analysis with visual indicators
 * - Functional impact assessment
 * - Work impact documentation
 * - Treatment history and effectiveness
 * - Clinical recommendations
 * - Legal disclaimer
 */

interface WCBExportOptions {
  /** Date range for the report */
  startDate: Date;
  endDate: Date;
  /** Optional patient name (de-identified if omitted) */
  patientName?: string;
  /** Optional claim number */
  claimNumber?: string;
  /** Optional healthcare provider */
  healthcareProvider?: string;
  /** Include detailed entries (may increase file size) */
  includeDetailedEntries?: boolean;
  /** Include a brief pain trend summary section */
  includeTrendSummary?: boolean;
}

export interface WorkSafeBCExportArtifact {
  reportId: string;
  dataUri: string;
  pdfBytes: Uint8Array;
  sha256: string;
  entryCount: number;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

type TrendPoint = { label: string; value: number };

function toDailyAveragePain(entries: PainEntry[], maxDays: number): TrendPoint[] {
  if (entries.length === 0) return [];

  const byDay = new Map<string, { sum: number; count: number; day: Date }>();
  for (const entry of entries) {
    const dt = new Date(entry.timestamp);
    // Normalize to local day key (YYYY-MM-DD)
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    const existing = byDay.get(key);
    if (existing) {
      existing.sum += entry.baselineData.pain;
      existing.count += 1;
    } else {
      const day = new Date(dt);
      day.setHours(0, 0, 0, 0);
      byDay.set(key, { sum: entry.baselineData.pain, count: 1, day });
    }
  }

  const points = Array.from(byDay.values())
    .sort((a, b) => a.day.getTime() - b.day.getTime())
    .slice(-maxDays)
    .map(({ day, sum, count }) => ({
      label: day.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
      /* v8 ignore next */
      value: count > 0 ? sum / count : 0,
    }));

  return points;
}

function drawMiniTrendBars(
  doc: jsPDF,
  points: TrendPoint[],
  x: number,
  y: number,
  width: number,
  height: number
) {
  /* v8 ignore next */
  if (points.length === 0) return;

  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(0.1, max - min);

  const barGap = 1;
  const barWidth = Math.max(1, Math.floor((width - barGap * (points.length - 1)) / points.length));

  // Light frame
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.2);
  doc.rect(x, y, width, height);

  // Bars
  doc.setFillColor(14, 165, 233); // sky-500
  for (let i = 0; i < points.length; i++) {
    const v = points[i].value;
    const normalized = (v - min) / span;
    const barH = Math.max(1, Math.round(normalized * (height - 2)));
    const bx = x + i * (barWidth + barGap);
    const by = y + height - 1 - barH;
    doc.rect(bx, by, barWidth, barH, 'F');
  }
}

interface ReportMetrics {
  totalEntries: number;
  averagePain: number;
  maxPain: number;
  minPain: number;
  painVariability: number;
  missedWorkDays: number;
  mostAffectedLocations: string[];
  mostCommonSymptoms: string[];
  treatmentEffectiveness: string;
}

/**
 * Calculate report metrics from pain entries
 */
function calculateMetrics(entries: PainEntry[]): ReportMetrics {
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      averagePain: 0,
      maxPain: 0,
      minPain: 0,
      painVariability: 0,
      missedWorkDays: 0,
      mostAffectedLocations: [],
      mostCommonSymptoms: [],
      treatmentEffectiveness: 'No data available',
    };
  }

  const painLevels = entries.map(e => e.baselineData.pain);
  const avgPain = painLevels.reduce((a, b) => a + b, 0) / painLevels.length;
  const maxPain = Math.max(...painLevels);
  const minPain = Math.min(...painLevels);
  
  // Calculate standard deviation for variability
  const variance = painLevels.reduce((acc, val) => acc + Math.pow(val - avgPain, 2), 0) / painLevels.length;
  const painVariability = Math.sqrt(variance);

  // Count missed work days
  const missedWorkDays = entries.reduce((total, e) => total + (e.workImpact?.missedWork || 0), 0);

  // Get most common locations
  const locationCounts: Record<string, number> = {};
  entries.forEach(e => {
    e.baselineData.locations?.forEach(loc => {
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
  });
  const mostAffectedLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([loc]) => loc);

  // Get most common symptoms
  const symptomCounts: Record<string, number> = {};
  entries.forEach(e => {
    e.baselineData.symptoms?.forEach(sym => {
      symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
    });
  });
  const mostCommonSymptoms = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([sym]) => sym);

  // Summarize treatment effectiveness
  const effectivenessReports = entries
    .map(e => e.treatments?.effectiveness)
    .filter(Boolean);
  const treatmentEffectiveness = effectivenessReports.length > 0
    ? `Based on ${effectivenessReports.length} reports`
    : 'No treatment effectiveness data recorded';

  return {
    totalEntries: entries.length,
    averagePain: avgPain,
    maxPain,
    minPain,
    painVariability,
    missedWorkDays,
    mostAffectedLocations,
    mostCommonSymptoms,
    treatmentEffectiveness,
  };
}

/**
 * Get pain severity description
 */
function getPainSeverity(pain: number): string {
  if (pain <= 2) return 'Mild';
  if (pain <= 4) return 'Moderate';
  if (pain <= 6) return 'Moderately Severe';
  if (pain <= 8) return 'Severe';
  return 'Extreme';
}

/**
 * Get pain trend description
 */
function getPainTrend(entries: PainEntry[]): string {
  if (entries.length < 2) return 'Insufficient data for trend analysis';
  
  const recentEntries = entries.slice(-7);
  const olderEntries = entries.slice(-14, -7);
  
  if (olderEntries.length === 0) return 'Trend analysis requires at least 2 weeks of data';
  
  const recentAvg = recentEntries.reduce((a, e) => a + e.baselineData.pain, 0) / recentEntries.length;
  const olderAvg = olderEntries.reduce((a, e) => a + e.baselineData.pain, 0) / olderEntries.length;
  
  const diff = recentAvg - olderAvg;
  
  if (Math.abs(diff) < 0.5) return 'Stable';
  if (diff > 1.5) return 'Significantly Worsening';
  if (diff > 0.5) return 'Slightly Worsening';
  if (diff < -1.5) return 'Significantly Improving';
  return 'Slightly Improving';
}

/**
 * Export enhanced WorkSafe BC PDF report
 */
export async function exportWorkSafeBCPDF(
  entries: PainEntry[],
  options: WCBExportOptions
): Promise<WorkSafeBCExportArtifact> {
  // Track analytics
  privacyAnalytics.trackDataExport('pdf').catch((error) => {
    analyticsLogger.swallowed(error, { context: 'exportWorkSafeBCPDF', exportType: 'wcb-pdf' });
  });
  trackDataExported('pdf', entries.length);
  trackExport('pdf', entries.length);

  const { 
    startDate, 
    endDate, 
    patientName, 
    claimNumber,
    healthcareProvider,
    includeDetailedEntries = true,
    includeTrendSummary = true,
  } = options;

  // Filter entries by date range
  const filteredEntries = entries.filter(entry => {
    const timestamp = new Date(entry.timestamp);
    return timestamp >= startDate && timestamp <= endDate;
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const metrics = calculateMetrics(filteredEntries);
  const painTrend = getPainTrend(filteredEntries);

  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 20;
  const rightMargin = pageWidth - 20;
  const contentWidth = rightMargin - leftMargin;
  const bottomLimit = pageHeight - 22;
  const reportId = `WCB-${Date.now().toString(36).toUpperCase()}`;

  const palette = {
    ink: [15, 23, 42] as const,
    muted: [71, 85, 105] as const,
    soft: [100, 116, 139] as const,
    border: [203, 213, 225] as const,
    surface: [248, 250, 252] as const,
    accent: [14, 165, 233] as const,
    accentSoft: [224, 242, 254] as const,
    warning: [180, 83, 9] as const,
    warningSoft: [254, 243, 199] as const,
    danger: [185, 28, 28] as const,
    dangerSoft: [254, 226, 226] as const,
    success: [22, 163, 74] as const,
    successSoft: [220, 252, 231] as const,
    slateBand: [30, 41, 59] as const,
  };

  const periodDays = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const drawContinuationHeader = () => {
    doc.setFillColor(...palette.surface);
    doc.rect(0, 0, pageWidth, 16, 'F');
    doc.setDrawColor(...palette.border);
    doc.setLineWidth(0.3);
    doc.line(0, 16, pageWidth, 16);
    doc.setTextColor(...palette.soft);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('WorkSafe BC Clinical Documentation Report', leftMargin, 10.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report ID: ${reportId}`, rightMargin, 10.5, { align: 'right' });
    yPosition = 24;
  };

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > bottomLimit) {
      doc.addPage();
      drawContinuationHeader();
      return true;
    }
    return false;
  };

  const drawSectionHeading = (title: string, subtitle?: string) => {
    checkPageBreak(24);
    doc.setTextColor(...palette.ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title, leftMargin, yPosition);
    yPosition += 4;

    doc.setDrawColor(...palette.accent);
    doc.setLineWidth(1.2);
    doc.line(leftMargin, yPosition + 1, leftMargin + 36, yPosition + 1);
    yPosition += 7;

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.7);
      doc.setTextColor(...palette.muted);
      const subLines = doc.splitTextToSize(subtitle, contentWidth);
      doc.text(subLines, leftMargin, yPosition);
      yPosition += subLines.length * 4 + 3;
    }
  };

  const drawMetricCard = (
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    value: string,
    tone: {
      bg: readonly [number, number, number];
      text: readonly [number, number, number];
    }
  ) => {
    doc.setFillColor(...tone.bg);
    doc.roundedRect(x, y, width, height, 2, 2, 'F');
    doc.setDrawColor(...palette.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, width, height, 2, 2);

    doc.setTextColor(...tone.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(value, x + width / 2, y + 11, { align: 'center' });

    doc.setDrawColor(...palette.border);
    doc.setLineWidth(0.15);
    doc.line(x + 3, y + 13.2, x + width - 3, y + 13.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(label, x + width / 2, y + 18, { align: 'center' });
  };

  const renderHeaderAndPatientInfo = () => {
    doc.setFillColor(...palette.ink);
    doc.rect(0, 0, pageWidth, 34, 'F');
    doc.setFillColor(...palette.accent);
    doc.rect(0, 34, pageWidth, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Pain Tracker Pro', leftMargin, 14);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('WorkSafe BC Clinical Documentation Report', leftMargin, 23);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Confidential clinical summary for case review', leftMargin, 29);

    doc.setFillColor(...palette.slateBand);
    doc.roundedRect(rightMargin - 66, 7, 66, 24, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-CA')}`, rightMargin - 62, 14);
    doc.text(`Report ID: ${reportId}`, rightMargin - 62, 19.5);
    doc.text(`Period: ${periodDays} day(s)`, rightMargin - 62, 25);

    yPosition = 46;

    doc.setFillColor(...palette.surface);
    doc.roundedRect(leftMargin, yPosition, contentWidth, 36, 3, 3, 'F');
    doc.setDrawColor(...palette.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(leftMargin, yPosition, contentWidth, 36, 3, 3);
    doc.setLineWidth(0.2);
    doc.line(leftMargin + contentWidth / 2, yPosition + 10, leftMargin + contentWidth / 2, yPosition + 32);
    doc.line(leftMargin + 4, yPosition + 20.5, rightMargin - 4, yPosition + 20.5);

    doc.setTextColor(...palette.ink);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient & Claim Information', leftMargin + 5, yPosition + 8.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const col1 = leftMargin + 5;
    const col2 = leftMargin + contentWidth / 2;
    doc.setTextColor(...palette.soft);
    doc.text('Patient', col1, yPosition + 15);
    doc.text('Claim #', col2, yPosition + 15);
    doc.text('Report Period', col1, yPosition + 27);
    doc.text('Provider', col2, yPosition + 27);

    doc.setTextColor(...palette.ink);
    doc.setFont('helvetica', 'bold');
    doc.text(patientName || '[De-identified]', col1 + 20, yPosition + 15);
    doc.text(claimNumber || 'N/A', col2 + 17, yPosition + 15);
    doc.text(
      `${startDate.toLocaleDateString('en-CA')} to ${endDate.toLocaleDateString('en-CA')}`,
      col1 + 26,
      yPosition + 27
    );
    doc.text(healthcareProvider || 'N/A', col2 + 16, yPosition + 27);

    yPosition += 46;
  };

  const renderExecutiveSummary = () => {
    drawSectionHeading('Executive Summary', 'Core metrics and period-level interpretation for WorkSafe BC review.');

    const cardGap = 4;
    const cardWidth = (contentWidth - cardGap) / 2;
    const cardHeight = 22;

    drawMetricCard(
      leftMargin,
      yPosition,
      cardWidth,
      cardHeight,
      'Average Pain',
      `${formatNumber(metrics.averagePain, 1)}/10`,
      { bg: palette.warningSoft, text: palette.warning }
    );
    drawMetricCard(
      leftMargin + cardWidth + cardGap,
      yPosition,
      cardWidth,
      cardHeight,
      'Peak Pain',
      `${metrics.maxPain}/10`,
      { bg: palette.dangerSoft, text: palette.danger }
    );
    yPosition += cardHeight + 4;

    drawMetricCard(
      leftMargin,
      yPosition,
      cardWidth,
      cardHeight,
      'Total Entries',
      String(metrics.totalEntries),
      { bg: palette.accentSoft, text: palette.accent }
    );
    drawMetricCard(
      leftMargin + cardWidth + cardGap,
      yPosition,
      cardWidth,
      cardHeight,
      'Work Days Missed',
      String(metrics.missedWorkDays),
      metrics.missedWorkDays > 0
        ? { bg: palette.dangerSoft, text: palette.danger }
        : { bg: palette.successSoft, text: palette.success }
    );

    yPosition += cardHeight + 9;

    doc.setTextColor(...palette.muted);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');

    const summaryText = `During this ${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}-day reporting period, the patient recorded ${metrics.totalEntries} pain entries. Pain levels ranged from ${metrics.minPain} to ${metrics.maxPain} (${getPainSeverity(metrics.maxPain)}), with an average intensity of ${formatNumber(metrics.averagePain, 1)}/10 (${getPainSeverity(metrics.averagePain)}). The overall pain trend is assessed as ${painTrend.toLowerCase()}.`;

    const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
    doc.text(summaryLines, leftMargin, yPosition);
    yPosition += summaryLines.length * 4.4 + 8;
  };

  const renderTrendSummary = () => {
    if (!includeTrendSummary) return;

    checkPageBreak(52);
    drawSectionHeading('Pain Trend Summary');

    doc.setFillColor(...palette.surface);
    doc.roundedRect(leftMargin, yPosition, contentWidth, 34, 2, 2, 'F');
    doc.setDrawColor(...palette.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(leftMargin, yPosition, contentWidth, 34, 2, 2);
    yPosition += 7;

    const points = toDailyAveragePain(filteredEntries, 14);
    const hasEnough = points.length >= 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...palette.muted);

    if (hasEnough) {
      const start = points[0].value;
      const end = points.at(-1)?.value ?? start;
      const delta = end - start;

      let direction = 'stable';
      if (Math.abs(delta) >= 0.3) {
        direction = delta > 0 ? 'worsening' : 'improving';
      }
      const deltaText = `${delta > 0 ? '+' : ''}${formatNumber(delta, 1)}`;

      doc.text(
        `Daily average pain over the last ${points.length} days is ${direction} (${deltaText} change from start to end of period segment).`,
        leftMargin,
        yPosition
      );
      yPosition += 6;

      const chartH = 14;
      const chartW = Math.min(110, contentWidth - 12);
      drawMiniTrendBars(doc, points, leftMargin, yPosition, chartW, chartH);

      doc.setFontSize(7.5);
      doc.setTextColor(...palette.soft);
      doc.text(points[0].label, leftMargin, yPosition + chartH + 6);
      const endLabel = points.at(-1)?.label ?? points[0].label;
      doc.text(endLabel, leftMargin + chartW, yPosition + chartH + 6, { align: 'right' });

      yPosition += 29;
      return;
    }

    doc.text('Not enough data in this period to render a trend summary.', leftMargin, yPosition);
    yPosition += 32;
  };

  const renderMissedWorkAlert = () => {
    if (metrics.missedWorkDays <= 0) return;
    checkPageBreak(12);
    doc.setTextColor(...palette.danger);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `ALERT: ${metrics.missedWorkDays} work day(s) were reported as missed during this period due to pain.`,
      leftMargin,
      yPosition
    );
    yPosition += 9;
  };

  const renderPainAnalysis = () => {
    drawSectionHeading('Pain Analysis', 'Primary locations, associated symptoms, and pain variability over the selected period.');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...palette.muted);

    const listBlockHeight = 30;
    doc.setFillColor(...palette.surface);
    doc.roundedRect(leftMargin, yPosition, contentWidth, listBlockHeight, 2, 2, 'F');
    doc.setDrawColor(...palette.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(leftMargin, yPosition, contentWidth, listBlockHeight, 2, 2);

    const colGap = 6;
    const colW = (contentWidth - colGap) / 2;
    const colLeft = leftMargin + 4;
    const colRight = leftMargin + colW + colGap + 2;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...palette.ink);
    doc.text('Primary Pain Locations', colLeft, yPosition + 6);
    doc.text('Associated Symptoms', colRight, yPosition + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...palette.muted);
    let locY = yPosition + 11;
    let symY = yPosition + 11;

    if (metrics.mostAffectedLocations.length > 0) {
      metrics.mostAffectedLocations.forEach((loc, index) => {
        if (index >= 4) return;
        doc.text(`• ${loc}`, colLeft, locY);
        locY += 4.5;
      });
    } else {
      doc.text('• No location data recorded', colLeft, locY);
    }

    if (metrics.mostCommonSymptoms.length > 0) {
      metrics.mostCommonSymptoms.forEach((symptom, index) => {
        if (index >= 4) return;
        doc.text(`• ${symptom}`, colRight, symY);
        symY += 4.5;
      });
    } else {
      doc.text('• No symptom data recorded', colRight, symY);
    }

    yPosition += listBlockHeight + 7;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...palette.ink);
    doc.text('Pain Variability:', leftMargin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...palette.muted);
    let variabilityDesc = 'High (fluctuating)';
    if (metrics.painVariability < 1) {
      variabilityDesc = 'Low (consistent)';
    } else if (metrics.painVariability < 2) {
      variabilityDesc = 'Moderate';
    }
    doc.text(
      `Standard deviation: ${formatNumber(metrics.painVariability, 2)} - ${variabilityDesc}`,
      leftMargin,
      yPosition + 5.5
    );
    yPosition += 12;
  };

  const renderFunctionalImpact = () => {
    drawSectionHeading('Functional Impact Assessment', 'Observed activity limitations and mobility aid usage recorded in the selected entries.');

    const allLimitations = new Set<string>();
    const allMobilityAids = new Set<string>();
    filteredEntries.forEach(entry => {
      entry.functionalImpact?.limitedActivities?.forEach(activity => allLimitations.add(activity));
      entry.functionalImpact?.mobilityAids?.forEach(aid => allMobilityAids.add(aid));
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...palette.muted);

    doc.setFillColor(...palette.surface);
    doc.roundedRect(leftMargin, yPosition, contentWidth, 34, 2, 2, 'F');
    doc.setDrawColor(...palette.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(leftMargin, yPosition, contentWidth, 34, 2, 2);

    let functionalY = yPosition + 7;

    if (allLimitations.size > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...palette.ink);
      doc.text('Activities Limited by Pain:', leftMargin + 4, functionalY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...palette.muted);
      functionalY += 5;
      Array.from(allLimitations).slice(0, 8).forEach(limitation => {
        doc.text(`• ${limitation}`, leftMargin + 7, functionalY);
        functionalY += 4.2;
      });
      functionalY += 2;
    }

    if (allMobilityAids.size > 0) {
      checkPageBreak(26);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...palette.ink);
      doc.text('Mobility Aids Used:', leftMargin + contentWidth / 2, yPosition + 7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...palette.muted);
      let aidsY = yPosition + 12;
      Array.from(allMobilityAids).forEach(aid => {
        doc.text(`• ${aid}`, leftMargin + contentWidth / 2 + 3, aidsY);
        aidsY += 4.2;
      });
    }

    yPosition += 38;
  };

  const renderWorkImpact = () => {
    drawSectionHeading('Work Impact', 'Attendance impact, workplace limitations, and modified duty requirements.');

    const allWorkLimitations = new Set<string>();
    const allModifiedDuties = new Set<string>();
    filteredEntries.forEach(entry => {
      entry.workImpact?.workLimitations?.forEach(limitation => allWorkLimitations.add(limitation));
      entry.workImpact?.modifiedDuties?.forEach(duty => allModifiedDuties.add(duty));
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...palette.muted);

    doc.setFillColor(...palette.surface);
    doc.roundedRect(leftMargin, yPosition, contentWidth, 36, 2, 2, 'F');
    doc.setDrawColor(...palette.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(leftMargin, yPosition, contentWidth, 36, 2, 2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...palette.ink);
    doc.text(`Total Work Days Missed: ${metrics.missedWorkDays}`, leftMargin + 4, yPosition + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...palette.muted);

    let workLeftY = yPosition + 13;
    let workRightY = yPosition + 13;

    if (allWorkLimitations.size > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...palette.ink);
      doc.text('Work-Related Limitations', leftMargin + 4, workLeftY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...palette.muted);
      workLeftY += 4.8;
      Array.from(allWorkLimitations).slice(0, 6).forEach(limitation => {
        doc.text(`• ${limitation}`, leftMargin + 6, workLeftY);
        workLeftY += 4.1;
      });
    } else {
      doc.text('No work-related limitations recorded.', leftMargin + 6, workLeftY + 1);
    }

    if (allModifiedDuties.size > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...palette.ink);
      doc.text('Required Accommodations', leftMargin + contentWidth / 2, workRightY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...palette.muted);
      workRightY += 4.8;
      Array.from(allModifiedDuties).slice(0, 6).forEach(duty => {
        doc.text(`• ${duty}`, leftMargin + contentWidth / 2 + 2, workRightY);
        workRightY += 4.1;
      });
    } else {
      doc.text('No modified duty requirements recorded.', leftMargin + contentWidth / 2 + 2, workRightY + 1);
    }

    yPosition += 40;
  };

  const renderDetailedEntries = () => {
    if (!(includeDetailedEntries && filteredEntries.length > 0)) return;

    drawSectionHeading('Daily Pain Log Summary', 'Structured daily entry breakdown for clinical review and case documentation.');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...palette.muted);

    const cDate = 24;
    const cPain = 14;
    const cLoc = 40;
    const cSym = 34;
    const cNotes = contentWidth - cDate - cPain - cLoc - cSym;

    const xDate = leftMargin;
    const xPain = xDate + cDate;
    const xLoc = xPain + cPain;
    const xSym = xLoc + cLoc;
    const xNotes = xSym + cSym;

    const drawTableHeader = () => {
      checkPageBreak(12);
      doc.setFillColor(241, 245, 249);
      doc.rect(leftMargin, yPosition, contentWidth, 8, 'F');
      doc.setDrawColor(...palette.border);
      doc.setLineWidth(0.25);
      doc.rect(leftMargin, yPosition, contentWidth, 8);
      doc.line(xPain, yPosition, xPain, yPosition + 8);
      doc.line(xLoc, yPosition, xLoc, yPosition + 8);
      doc.line(xSym, yPosition, xSym, yPosition + 8);
      doc.line(xNotes, yPosition, xNotes, yPosition + 8);

      doc.setTextColor(...palette.ink);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Date', xDate + 2, yPosition + 5.3);
      doc.text('Pain', xPain + 2, yPosition + 5.3);
      doc.text('Locations', xLoc + 2, yPosition + 5.3);
      doc.text('Symptoms', xSym + 2, yPosition + 5.3);
      doc.text('Notes', xNotes + 2, yPosition + 5.3);
      yPosition += 9;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...palette.muted);
    };

    drawTableHeader();

    const maxEntries = Math.min(filteredEntries.length, 25);

    for (let i = 0; i < maxEntries; i++) {
      const entry = filteredEntries[i];
      const date = new Date(entry.timestamp).toLocaleDateString('en-CA');
      const pain = entry.baselineData.pain;
      const locations = (entry.baselineData.locations || []).slice(0, 3).join(', ') || '-';
      const symptoms = (entry.baselineData.symptoms || []).slice(0, 3).join(', ') || '-';
      const notes = (entry.notes || '-').trim() || '-';

      const locLines = doc.splitTextToSize(locations, cLoc - 4);
      const symLines = doc.splitTextToSize(symptoms, cSym - 4);
      const noteLines = doc.splitTextToSize(notes, cNotes - 4).slice(0, 3);
      const maxLines = Math.max(1, locLines.length, symLines.length, noteLines.length);
      const rowHeight = Math.max(7, maxLines * 3.6 + 1.8);

      if (yPosition + rowHeight > bottomLimit) {
        doc.addPage();
        drawContinuationHeader();
        drawTableHeader();
      }

      if (i % 2 === 0) {
        doc.setFillColor(...palette.surface);
        doc.rect(leftMargin, yPosition - 2.2, contentWidth, rowHeight, 'F');
      }

      doc.setDrawColor(...palette.border);
      doc.setLineWidth(0.1);
      doc.rect(leftMargin, yPosition - 2.2, contentWidth, rowHeight);
      doc.line(xPain, yPosition - 2.2, xPain, yPosition - 2.2 + rowHeight);
      doc.line(xLoc, yPosition - 2.2, xLoc, yPosition - 2.2 + rowHeight);
      doc.line(xSym, yPosition - 2.2, xSym, yPosition - 2.2 + rowHeight);
      doc.line(xNotes, yPosition - 2.2, xNotes, yPosition - 2.2 + rowHeight);

      doc.text(date, xDate + 2, yPosition + 1.2);
      doc.text(`${pain}/10`, xPain + 2, yPosition + 1.2);
      doc.text(locLines, xLoc + 2, yPosition + 1.2);
      doc.text(symLines, xSym + 2, yPosition + 1.2);
      doc.text(noteLines, xNotes + 2, yPosition + 1.2);

      yPosition += rowHeight;
    }

    if (filteredEntries.length > maxEntries) {
      doc.setTextColor(...palette.soft);
      doc.text(`... and ${filteredEntries.length - maxEntries} more entries`, leftMargin, yPosition + 5);
      yPosition += 10;
    }
  };

  const renderDisclaimer = () => {
    checkPageBreak(40);
    yPosition += 8;
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(leftMargin, yPosition, contentWidth, 35, 3, 3, 'F');
    doc.setDrawColor(253, 230, 138);
    doc.setLineWidth(0.25);
    doc.roundedRect(leftMargin, yPosition, contentWidth, 35, 3, 3);

    doc.setFontSize(8.7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(133, 77, 14);
    doc.text('IMPORTANT DISCLAIMER', leftMargin + 5, yPosition + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const disclaimerText =
      'This report is a structured summary of self-reported pain data for WorkSafe BC reference only. It does not constitute medical advice, diagnosis, or treatment. This document should be reviewed with a qualified healthcare provider. Pain Tracker Pro is not affiliated with WorkSafe BC.';
    const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 10);
    doc.text(disclaimerLines, leftMargin + 5, yPosition + 15);
  };

  const renderFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(...palette.ink);
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`Pain Tracker Pro | WorkSafe BC Clinical Report | ${reportId}`, leftMargin, pageHeight - 8);
      doc.text(`Page ${i} of ${pageCount}`, rightMargin, pageHeight - 8, { align: 'right' });
    }
  };

  renderHeaderAndPatientInfo();
  renderExecutiveSummary();
  renderTrendSummary();
  renderMissedWorkAlert();
  renderPainAnalysis();
  renderFunctionalImpact();
  renderWorkImpact();
  renderDetailedEntries();
  renderDisclaimer();
  renderFooter();

  const arrayBuffer = doc.output('arraybuffer');
  const pdfBytes = new Uint8Array(arrayBuffer);
  const sha256 = await sha256Hex(pdfBytes);

  return {
    reportId,
    dataUri: doc.output('datauristring'),
    pdfBytes,
    sha256,
    entryCount: filteredEntries.length,
  };
}

/**
 * Download the WorkSafe BC PDF report
 */
export async function downloadWorkSafeBCPDF(
  entries: PainEntry[],
  options: WCBExportOptions
): Promise<void> {
  const pdf = await exportWorkSafeBCPDF(entries, options);
  
  // Create filename with date range
  const startStr = options.startDate.toISOString().split('T')[0];
  const endStr = options.endDate.toISOString().split('T')[0];
  const filename = `PainTracker-WCB-Report-${startStr}-to-${endStr}.pdf`;

  const manifestFilename = `PainTracker-WCB-Report-${startStr}-to-${endStr}.manifest.json`;
  const manifest = {
    schemaVersion: 1,
    exportType: 'work-safebc-pdf',
    generatedAt: new Date().toISOString(),
    reportId: pdf.reportId,
    startDate: options.startDate.toISOString(),
    endDate: options.endDate.toISOString(),
    entryCount: pdf.entryCount,
    fileName: filename,
    sha256: pdf.sha256,
    algorithm: 'SHA-256',
    byteLength: pdf.pdfBytes.byteLength,
  };
  
  // Download the PDF as a Blob so the bytes match the checksum exactly.
  // Ensure we hand the DOM a Uint8Array backed by an ArrayBuffer (not ArrayBufferLike)
  // to satisfy strict TS DOM typings.
  const pdfBytes = new Uint8Array(pdf.pdfBytes);
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const pdfLink = document.createElement('a');
  pdfLink.href = pdfUrl;
  pdfLink.download = filename;
  document.body.appendChild(pdfLink);
  pdfLink.click();
  pdfLink.remove();
  URL.revokeObjectURL(pdfUrl);

  // Download sidecar manifest
  const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: 'application/json',
  });
  const manifestUrl = URL.createObjectURL(manifestBlob);

  const manifestLink = document.createElement('a');
  manifestLink.href = manifestUrl;
  manifestLink.download = manifestFilename;
  document.body.appendChild(manifestLink);
  manifestLink.click();
  manifestLink.remove();
  URL.revokeObjectURL(manifestUrl);
}

export default exportWorkSafeBCPDF;

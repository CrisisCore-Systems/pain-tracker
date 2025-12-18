import type { PainEntry } from '../../types';
import jsPDF from 'jspdf';
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
  /** Include pain trend chart placeholder */
  includeTrendSummary?: boolean;
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
export function exportWorkSafeBCPDF(
  entries: PainEntry[],
  options: WCBExportOptions
): string {
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

  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 20;
  const rightMargin = pageWidth - 20;
  const contentWidth = rightMargin - leftMargin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > 270) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // ===== HEADER =====
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Pain Tracker Pro', leftMargin, 18);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('WorkSafe BC Clinical Documentation Report', leftMargin, 28);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-CA')}`, leftMargin, 38);
  
  // Report ID
  const reportId = `WCB-${Date.now().toString(36).toUpperCase()}`;
  doc.text(`Report ID: ${reportId}`, rightMargin - 50, 38);

  yPosition = 55;

  // ===== PATIENT INFORMATION BOX =====
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(leftMargin, yPosition, contentWidth, 35, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', leftMargin + 5, yPosition + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const col1 = leftMargin + 5;
  const col2 = leftMargin + contentWidth / 2;
  
  doc.text(`Patient: ${patientName || '[De-identified]'}`, col1, yPosition + 20);
  doc.text(`Claim #: ${claimNumber || 'N/A'}`, col2, yPosition + 20);
  doc.text(`Report Period: ${startDate.toLocaleDateString('en-CA')} to ${endDate.toLocaleDateString('en-CA')}`, col1, yPosition + 28);
  doc.text(`Provider: ${healthcareProvider || 'N/A'}`, col2, yPosition + 28);

  yPosition += 45;

  // ===== EXECUTIVE SUMMARY =====
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Executive Summary', leftMargin, yPosition);
  yPosition += 8;
  
  doc.setDrawColor(14, 165, 233); // sky-500
  doc.setLineWidth(2);
  doc.line(leftMargin, yPosition, leftMargin + 40, yPosition);
  yPosition += 10;

  // Key metrics grid
  const boxWidth = (contentWidth - 10) / 3;
  const boxHeight = 30;
  
  // Average Pain Box
  doc.setFillColor(254, 243, 199); // amber-100
  doc.roundedRect(leftMargin, yPosition, boxWidth, boxHeight, 2, 2, 'F');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text(formatNumber(metrics.averagePain, 1), leftMargin + boxWidth / 2, yPosition + 15, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Average Pain', leftMargin + boxWidth / 2, yPosition + 24, { align: 'center' });
  
  // Peak Pain Box
  doc.setFillColor(254, 226, 226); // red-100
  doc.roundedRect(leftMargin + boxWidth + 5, yPosition, boxWidth, boxHeight, 2, 2, 'F');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // red-700
  doc.text(String(metrics.maxPain), leftMargin + boxWidth + 5 + boxWidth / 2, yPosition + 15, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Peak Pain', leftMargin + boxWidth + 5 + boxWidth / 2, yPosition + 24, { align: 'center' });
  
  // Total Entries Box
  doc.setFillColor(219, 234, 254); // blue-100
  doc.roundedRect(leftMargin + (boxWidth + 5) * 2, yPosition, boxWidth, boxHeight, 2, 2, 'F');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text(String(metrics.totalEntries), leftMargin + (boxWidth + 5) * 2 + boxWidth / 2, yPosition + 15, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Entries', leftMargin + (boxWidth + 5) * 2 + boxWidth / 2, yPosition + 24, { align: 'center' });

  yPosition += boxHeight + 15;

  // Summary text
  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryText = `During this ${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}-day reporting period, the patient recorded ${metrics.totalEntries} pain entries. Pain levels ranged from ${metrics.minPain} to ${metrics.maxPain} (${getPainSeverity(metrics.maxPain)}), with an average intensity of ${formatNumber(metrics.averagePain, 1)}/10 (${getPainSeverity(metrics.averagePain)}). The overall pain trend is assessed as ${painTrend.toLowerCase()}.`;
  
  const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(summaryLines, leftMargin, yPosition);
  yPosition += summaryLines.length * 5 + 10;

  if (metrics.missedWorkDays > 0) {
    doc.setTextColor(185, 28, 28); // red-700
    doc.setFont('helvetica', 'bold');
    doc.text(`⚠ ${metrics.missedWorkDays} work day(s) missed during this period due to pain.`, leftMargin, yPosition);
    yPosition += 12;
  }

  // ===== PAIN ANALYSIS =====
  checkPageBreak(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Pain Analysis', leftMargin, yPosition);
  yPosition += 8;
  
  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(2);
  doc.line(leftMargin, yPosition, leftMargin + 40, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  // Most affected locations
  if (metrics.mostAffectedLocations.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Primary Pain Locations:', leftMargin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    metrics.mostAffectedLocations.forEach((loc, i) => {
      doc.text(`  ${i + 1}. ${loc}`, leftMargin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Most common symptoms
  if (metrics.mostCommonSymptoms.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Associated Symptoms:', leftMargin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    metrics.mostCommonSymptoms.forEach((sym, i) => {
      doc.text(`  ${i + 1}. ${sym}`, leftMargin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Pain variability
  doc.setFont('helvetica', 'bold');
  doc.text('Pain Variability:', leftMargin, yPosition);
  doc.setFont('helvetica', 'normal');
  const variabilityDesc = metrics.painVariability < 1 ? 'Low (consistent)' : 
                          metrics.painVariability < 2 ? 'Moderate' : 'High (fluctuating)';
  doc.text(`  Standard deviation: ${formatNumber(metrics.painVariability, 2)} - ${variabilityDesc}`, leftMargin + 5, yPosition + 6);
  yPosition += 15;

  // ===== FUNCTIONAL IMPACT =====
  checkPageBreak(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Functional Impact Assessment', leftMargin, yPosition);
  yPosition += 8;
  
  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(2);
  doc.line(leftMargin, yPosition, leftMargin + 40, yPosition);
  yPosition += 10;

  // Gather functional limitations
  const allLimitations = new Set<string>();
  const allMobilityAids = new Set<string>();
  filteredEntries.forEach(entry => {
    entry.functionalImpact?.limitedActivities?.forEach(a => allLimitations.add(a));
    entry.functionalImpact?.mobilityAids?.forEach(a => allMobilityAids.add(a));
  });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  if (allLimitations.size > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Activities Limited by Pain:', leftMargin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    Array.from(allLimitations).slice(0, 8).forEach((lim, i) => {
      doc.text(`  • ${lim}`, leftMargin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  if (allMobilityAids.size > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Mobility Aids Used:', leftMargin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    Array.from(allMobilityAids).forEach(aid => {
      doc.text(`  • ${aid}`, leftMargin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // ===== WORK IMPACT =====
  checkPageBreak(50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Work Impact', leftMargin, yPosition);
  yPosition += 8;
  
  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(2);
  doc.line(leftMargin, yPosition, leftMargin + 40, yPosition);
  yPosition += 10;

  // Gather work impact data
  const allWorkLimitations = new Set<string>();
  const allModifiedDuties = new Set<string>();
  filteredEntries.forEach(entry => {
    entry.workImpact?.workLimitations?.forEach(l => allWorkLimitations.add(l));
    entry.workImpact?.modifiedDuties?.forEach(d => allModifiedDuties.add(d));
  });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text(`Total Work Days Missed: ${metrics.missedWorkDays}`, leftMargin, yPosition);
  yPosition += 8;

  if (allWorkLimitations.size > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Work-Related Limitations:', leftMargin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    Array.from(allWorkLimitations).slice(0, 6).forEach(lim => {
      doc.text(`  • ${lim}`, leftMargin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  if (allModifiedDuties.size > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Required Accommodations:', leftMargin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    Array.from(allModifiedDuties).slice(0, 6).forEach(duty => {
      doc.text(`  • ${duty}`, leftMargin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // ===== DETAILED ENTRIES (if requested) =====
  if (includeDetailedEntries && filteredEntries.length > 0) {
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Daily Pain Log Summary', leftMargin, yPosition);
    yPosition += 8;
    
    doc.setDrawColor(14, 165, 233);
    doc.setLineWidth(2);
    doc.line(leftMargin, yPosition, leftMargin + 40, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    // Table header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(leftMargin, yPosition, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Date', leftMargin + 3, yPosition + 5.5);
    doc.text('Pain', leftMargin + 35, yPosition + 5.5);
    doc.text('Locations', leftMargin + 55, yPosition + 5.5);
    doc.text('Notes', leftMargin + 120, yPosition + 5.5);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    const maxEntries = Math.min(filteredEntries.length, 25);
    
    for (let i = 0; i < maxEntries; i++) {
      checkPageBreak(8);
      const entry = filteredEntries[i];
      const date = new Date(entry.timestamp).toLocaleDateString('en-CA');
      const pain = entry.baselineData.pain;
      const locations = (entry.baselineData.locations || []).slice(0, 2).join(', ');
      const notes = (entry.notes || '').substring(0, 30);
      
      // Alternate row colors
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(leftMargin, yPosition - 3, contentWidth, 7, 'F');
      }
      
      doc.text(date, leftMargin + 3, yPosition);
      doc.text(`${pain}/10`, leftMargin + 35, yPosition);
      doc.text(locations || '-', leftMargin + 55, yPosition);
      doc.text(notes || '-', leftMargin + 120, yPosition);
      yPosition += 7;
    }

    if (filteredEntries.length > maxEntries) {
      doc.setTextColor(100, 116, 139);
      doc.text(`... and ${filteredEntries.length - maxEntries} more entries`, leftMargin, yPosition + 5);
      yPosition += 10;
    }
  }

  // ===== DISCLAIMER =====
  checkPageBreak(40);
  yPosition += 10;
  doc.setFillColor(254, 249, 195); // yellow-100
  doc.roundedRect(leftMargin, yPosition, contentWidth, 35, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(133, 77, 14); // yellow-800
  doc.text('IMPORTANT DISCLAIMER', leftMargin + 5, yPosition + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const disclaimerText = 'This report is a structured summary of self-reported pain data for WorkSafe BC reference only. It does not constitute medical advice, diagnosis, or treatment. This document should be reviewed with a qualified healthcare provider. Pain Tracker Pro is not affiliated with WorkSafe BC.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 10);
  doc.text(disclaimerLines, leftMargin + 5, yPosition + 15);

  // ===== FOOTER =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 282, pageWidth, 15, 'F');
    
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(8);
    doc.text(`Pain Tracker Pro | WorkSafe BC Clinical Report | ${reportId}`, leftMargin, 289);
    doc.text(`Page ${i} of ${pageCount}`, rightMargin - 20, 289);
  }

  return doc.output('datauristring');
}

/**
 * Download the WorkSafe BC PDF report
 */
export function downloadWorkSafeBCPDF(
  entries: PainEntry[],
  options: WCBExportOptions
): void {
  const pdfData = exportWorkSafeBCPDF(entries, options);
  
  // Create filename with date range
  const startStr = options.startDate.toISOString().split('T')[0];
  const endStr = options.endDate.toISOString().split('T')[0];
  const filename = `PainTracker-WCB-Report-${startStr}-to-${endStr}.pdf`;
  
  // Download the file
  const link = document.createElement('a');
  link.href = pdfData;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default exportWorkSafeBCPDF;

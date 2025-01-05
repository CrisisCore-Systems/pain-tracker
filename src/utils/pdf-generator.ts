import { jsPDF } from 'jspdf';
import type { WCBReport } from '../types';

interface PDFOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'letter' | 'legal' | 'a4';
}

export async function generateWCBReportPDF(
  report: WCBReport,
  options: PDFOptions = {}
): Promise<void> {
  const {
    filename = `WCB_Report_${report.claimInfo?.claimNumber || 'Draft'}.pdf`,
    orientation = 'portrait',
    format = 'letter'
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format
  });

  // Add header
  doc.setFontSize(20);
  doc.text('Workers Compensation Board Report', 20, 20);
  
  // Add claim info
  doc.setFontSize(12);
  let yPos = 40;
  
  if (report.claimInfo) {
    doc.text(`Claim Number: ${report.claimInfo.claimNumber || 'Not Assigned'}`, 20, yPos);
    yPos += 10;
    doc.text(`Injury Date: ${new Date(report.claimInfo.injuryDate).toLocaleDateString()}`, 20, yPos);
    yPos += 20;
  }

  // Add pain analysis
  doc.setFontSize(16);
  doc.text('Pain Analysis', 20, yPos);
  doc.setFontSize(12);
  yPos += 10;
  doc.text(`Average Pain Level: ${report.painTrends.average}/10`, 20, yPos);
  
  // Add most affected areas
  yPos += 10;
  doc.text('Most Affected Areas:', 20, yPos);
  yPos += 5;
  Object.entries(report.painTrends.locations)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([location, frequency]) => {
      yPos += 5;
      doc.text(`• ${location} (${frequency} occurrences)`, 25, yPos);
    });

  // Add work impact
  yPos += 20;
  doc.setFontSize(16);
  doc.text('Work Impact', 20, yPos);
  doc.setFontSize(12);
  yPos += 10;
  doc.text(`Missed Work Days: ${report.workImpact.missedDays}`, 20, yPos);

  // Add work limitations
  yPos += 10;
  doc.text('Work Limitations:', 20, yPos);
  report.workImpact.limitations.forEach(([limitation]) => {
    yPos += 5;
    doc.text(`• ${limitation}`, 25, yPos);
  });

  // Add accommodations if any
  if (report.workImpact.accommodationsNeeded.length > 0) {
    yPos += 15;
    doc.text('Required Accommodations:', 20, yPos);
    report.workImpact.accommodationsNeeded.forEach(accommodation => {
      yPos += 5;
      doc.text(`• ${accommodation}`, 25, yPos);
    });
  }

  // Add treatment progress
  yPos += 20;
  doc.setFontSize(16);
  doc.text('Treatment Progress', 20, yPos);
  doc.setFontSize(12);
  yPos += 10;
  doc.text('Current Treatments:', 20, yPos);
  report.treatments.current.forEach(({ treatment, frequency }) => {
    yPos += 5;
    doc.text(`• ${treatment} (${frequency} sessions)`, 25, yPos);
  });
  yPos += 10;
  doc.text(`Overall Effectiveness: ${report.treatments.effectiveness}`, 20, yPos);

  // Add recommendations
  if (report.recommendations.length > 0) {
    yPos += 20;
    doc.setFontSize(16);
    doc.text('Recommendations', 20, yPos);
    doc.setFontSize(12);
    report.recommendations.forEach(recommendation => {
      yPos += 10;
      // Split long recommendations into multiple lines
      const lines = doc.splitTextToSize(recommendation, 170) as string[];
      lines.forEach((line: string) => {
        if (yPos > 270) { // Check if we need a new page
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${line}`, 25, yPos);
        yPos += 5;
      });
    });
  }

  // Add footer with date and page numbers
  const pageCount = (doc as any).internal.pages.length;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
      20,
      285
    );
  }

  // Save the PDF
  doc.save(filename);
} 
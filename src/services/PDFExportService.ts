import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { WCBReport } from '../../types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class PDFExportService {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  /**
   * Generate a WCB report PDF
   */
  generateWCBReport(report: WCBReport): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        this.doc = new jsPDF();
        this.setupDocument();
        this.addHeader(report);
        this.addPainTrends(report);
        this.addWorkImpact(report);
        this.addFunctionalAnalysis(report);
        this.addTreatments(report);
        this.addRecommendations(report);

        // Return as blob
        const blob = this.doc.output('blob');
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Download the PDF with a given filename
   */
  downloadWCBReport(report: WCBReport, filename?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const defaultFilename = `wcb-report-${new Date(report.period.start).toISOString().split('T')[0]}-to-${new Date(report.period.end).toISOString().split('T')[0]}.pdf`;

        this.generateWCBReport(report).then(blob => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename || defaultFilename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve();
        }).catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupDocument(): void {
    // Set document properties
    this.doc.setProperties({
      title: 'WCB Pain Report',
      subject: 'Workers Compensation Board Pain Tracking Report',
      author: 'Pain Tracker Pro',
      keywords: 'pain, tracking, WCB, report',
      creator: 'Pain Tracker Pro'
    });
  }

  private addHeader(report: WCBReport): void {
    // Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Workers Compensation Board', 20, 30);
    this.doc.text('Pain Tracking Report', 20, 40);

    // Period
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Report Period: ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}`, 20, 60);

    // Generated date
    this.doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 70);

    this.doc.line(20, 80, 190, 80);
  }

  private addPainTrends(report: WCBReport): void {
    let yPosition = 90;

    // Section header
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Pain Trends', 20, yPosition);
    yPosition += 10;

    // Average pain
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Average Pain Level: ${report.painTrends.average.toFixed(1)}/10`, 20, yPosition);
    yPosition += 10;

    // Pain locations
    if (Object.keys(report.painTrends.locations).length > 0) {
      this.doc.text('Common Pain Locations:', 20, yPosition);
      yPosition += 8;

      const locationData = Object.entries(report.painTrends.locations)
        .sort(([, a], [, b]) => b - a)
        .map(([location, count]) => [location, count.toString()]);

      this.doc.autoTable({
        startY: yPosition,
        head: [['Location', 'Occurrences']],
        body: locationData,
        margin: { left: 20 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    } else {
      this.doc.text('No pain location data recorded.', 20, yPosition);
      yPosition += 10;
    }
  }

  private addWorkImpact(report: WCBReport): void {
    // Section header
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Work Impact', 20, this.doc.internal.pageSize.height > 150 ? 150 : 120);
    let yPosition = (this.doc.internal.pageSize.height > 150 ? 160 : 130);

    // Missed days
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Missed Work Days: ${report.workImpact.missedDays}`, 20, yPosition);
    yPosition += 10;

    // Limitations
    if (report.workImpact.limitations.length > 0) {
      this.doc.text('Work Limitations:', 20, yPosition);
      yPosition += 8;

      const limitationData = report.workImpact.limitations.map(([limitation, frequency]) => [
        limitation,
        frequency.toString()
      ]);

      this.doc.autoTable({
        startY: yPosition,
        head: [['Limitation', 'Frequency']],
        body: limitationData,
        margin: { left: 20 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [231, 76, 60] },
      });

      yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    }

    // Accommodations
    if (report.workImpact.accommodationsNeeded.length > 0) {
      this.doc.text('Workplace Accommodations Needed:', 20, yPosition);
      yPosition += 8;

      const accommodationData = report.workImpact.accommodationsNeeded.map(acc => [acc]);

      this.doc.autoTable({
        startY: yPosition,
        head: [['Accommodation']],
        body: accommodationData,
        margin: { left: 20 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [46, 204, 113] },
      });

      yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    }
  }

  private addFunctionalAnalysis(report: WCBReport): void {
    // Check if we need a new page
    let yPosition = (this.doc as any).lastAutoTable?.finalY || 200;
    if (yPosition > 250) {
      this.doc.addPage();
      yPosition = 30;
    }

    // Section header
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Functional Analysis', 20, yPosition);
    yPosition += 10;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');

    // Limitations
    if (report.functionalAnalysis.limitations.length > 0) {
      this.doc.text('Functional Limitations:', 20, yPosition);
      yPosition += 8;

      const limitationData = report.functionalAnalysis.limitations.map(lim => [lim]);

      this.doc.autoTable({
        startY: yPosition,
        head: [['Limitation']],
        body: limitationData,
        margin: { left: 20 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [155, 89, 182] },
      });

      yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    }

    // Changes over time
    if (report.functionalAnalysis.deterioration.length > 0 || report.functionalAnalysis.improvements.length > 0) {
      this.doc.text('Changes Over Time:', 20, yPosition);
      yPosition += 8;

      const changes = [
        ...report.functionalAnalysis.deterioration.map(change => ['Deterioration', change]),
        ...report.functionalAnalysis.improvements.map(change => ['Improvement', change])
      ];

      this.doc.autoTable({
        startY: yPosition,
        head: [['Type', 'Description']],
        body: changes,
        margin: { left: 20 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [230, 126, 34] },
      });

      yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    }
  }

  private addTreatments(report: WCBReport): void {
    // Check if we need a new page
    let yPosition = (this.doc as any).lastAutoTable?.finalY || 200;
    if (yPosition > 220) {
      this.doc.addPage();
      yPosition = 30;
    }

    // Section header
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Treatments', 20, yPosition);
    yPosition += 10;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');

    // Current treatments
    if (report.treatments.current.length > 0) {
      this.doc.text('Current Treatments:', 20, yPosition);
      yPosition += 8;

      const treatmentData = report.treatments.current.map(treatment => [
        treatment.treatment,
        treatment.frequency.toString()
      ]);

      this.doc.autoTable({
        startY: yPosition,
        head: [['Treatment', 'Frequency']],
        body: treatmentData,
        margin: { left: 20 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [26, 188, 156] },
      });

      yPosition = (this.doc as any).lastAutoTable.finalY + 10;
    }

    // Effectiveness
    this.doc.text(`Treatment Effectiveness: ${report.treatments.effectiveness}`, 20, yPosition);
  }

  private addRecommendations(report: WCBReport): void {
    // Check if we need a new page
    let yPosition = (this.doc as any).lastAutoTable?.finalY || 250;
    if (yPosition > 200) {
      this.doc.addPage();
      yPosition = 30;
    }

    // Section header
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recommendations', 20, yPosition);
    yPosition += 10;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');

    // Recommendations list
    report.recommendations.forEach((recommendation, index) => {
      const lines = this.doc.splitTextToSize(recommendation, 160);
      this.doc.text(`${index + 1}.`, 20, yPosition);
      this.doc.text(lines, 30, yPosition);
      yPosition += lines.length * 5 + 3;
    });

    // Footer
    const pageHeight = this.doc.internal.pageSize.height;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('Generated by Pain Tracker Pro - Confidential Medical Information', 20, pageHeight - 20);
    this.doc.text(`Page ${this.doc.getNumberOfPages()}`, 180, pageHeight - 20);
  }
}

// Export singleton instance
export const pdfExportService = new PDFExportService();

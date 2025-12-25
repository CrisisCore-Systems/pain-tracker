import type { WCBReport } from '../types/index';
import type { jsPDF as jsPDFType } from 'jspdf';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
    lastAutoTable?: {
      finalY?: number;
    };
  }
}

export class PDFExportService {
  private doc: jsPDFType | null = null;

  private readonly marginX = 20;
  private readonly marginTop = 24;
  private readonly marginBottom = 20;
  private readonly contentFontSize = 11;
  private readonly sectionFontSize = 14;
  private readonly titleFontSize = 20;

  constructor() {
    // Lazy initialization - doc created when needed
  }

  /**
   * Dynamically import jsPDF and initialize document
   */
  private async initializePDF(): Promise<jsPDFType> {
    if (this.doc) return this.doc;

    const [{ default: jsPDF }, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    // In some runtimes (notably Node/tsx), importing jspdf-autotable does not
    // automatically attach the plugin to jsPDF instances.
    const applyPlugin = (autoTableModule as unknown as { applyPlugin?: (jspdf: unknown) => void })
      .applyPlugin;
    if (typeof applyPlugin === 'function') {
      applyPlugin(jsPDF);
    }

    this.doc = new jsPDF();
    return this.doc;
  }

  /**
   * Generate a WCB report PDF
   */
  async generateWCBReport(
    report: WCBReport,
    options?: {
      watermarkText?: string;
    }
  ): Promise<Blob> {
    // Dynamically load jsPDF libraries (allow errors to surface naturally for upstream handling)
    await this.initializePDF();
    this.setupDocument();

    let y = this.addHeader(report);
    y = this.addPainTrends(report, y);
    y = this.addWorkImpact(report, y);
    y = this.addFunctionalAnalysis(report, y);
    y = this.addTreatments(report, y);
    this.addRecommendations(report, y);
    this.addFooter();

    if (options?.watermarkText) {
      this.applyWatermark(options.watermarkText);
    }

    return this.doc!.output('blob');
  }

  private applyWatermark(text: string): void {
    if (!this.doc) return;

    const pageCount = this.doc.getNumberOfPages();
    const { width, height } = this.doc.internal.pageSize;

    for (let page = 1; page <= pageCount; page++) {
      this.doc.setPage(page);

      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(42);
      this.doc.setTextColor(200, 200, 200);

      // jsPDF typings for text options can lag behind runtime capabilities.
      // Keep this narrowly-cast to avoid widening types across the app.
      this.doc.text(text, width / 2, height / 2, {
        align: 'center',
        angle: 35,
      } as unknown as Record<string, unknown>);
    }

    // Reset to sane defaults for any future operations on the same doc instance.
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
  }

  /**
   * Download the PDF with a given filename
   */
  downloadWCBReport(report: WCBReport, filename?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const defaultFilename = `wcb-report-${new Date(report.period.start).toISOString().split('T')[0]}-to-${new Date(report.period.end).toISOString().split('T')[0]}.pdf`;

        this.generateWCBReport(report)
          .then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || defaultFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            resolve();
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupDocument(): void {
    // Set document properties
    this.doc!.setProperties({
      title: 'WCB Pain Report',
      subject: 'Workers Compensation Board Pain Tracking Report',
      author: 'Pain Tracker Pro',
      keywords: 'pain, tracking, WCB, report',
      creator: 'Pain Tracker Pro',
    });
  }

  private getPageSize(): { width: number; height: number } {
    const { width, height } = this.doc!.internal.pageSize;
    return { width, height };
  }

  private getContentWidth(): number {
    const { width } = this.getPageSize();
    return width - this.marginX * 2;
  }

  private ensureSpace(y: number, needed: number): number {
    const { height } = this.getPageSize();
    if (y + needed <= height - this.marginBottom) return y;
    this.doc!.addPage();
    return this.marginTop;
  }

  private writeSectionTitle(title: string, y: number): number {
    y = this.ensureSpace(y, 18);
    this.doc!.setFontSize(this.sectionFontSize);
    this.doc!.setFont('helvetica', 'bold');
    this.doc!.text(title, this.marginX, y);
    return y + 10;
  }

  private writeParagraph(text: string, y: number): number {
    y = this.ensureSpace(y, 14);
    this.doc!.setFontSize(this.contentFontSize);
    this.doc!.setFont('helvetica', 'normal');
    const lines = this.doc!.splitTextToSize(text, this.getContentWidth());
    this.doc!.text(lines, this.marginX, y);
    return y + lines.length * 5 + 4;
  }

  private addHeader(report: WCBReport): number {
    let y = this.marginTop;

    // Title
    this.doc!.setFontSize(this.titleFontSize);
    this.doc!.setFont('helvetica', 'bold');
    this.doc!.text('Workers Compensation Board', this.marginX, y);
    y += 10;
    this.doc!.text('Pain Tracking Report', this.marginX, y);
    y += 14;

    // Meta
    this.doc!.setFontSize(12);
    this.doc!.setFont('helvetica', 'normal');
    const period = `Report Period: ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}`;
    y = this.writeParagraph(period, y);

    const generated = `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    y = this.writeParagraph(generated, y);

    const { width } = this.getPageSize();
    this.doc!.setDrawColor(180);
    this.doc!.line(this.marginX, y, width - this.marginX, y);
    this.doc!.setDrawColor(0);
    return y + 12;
  }

  private addPainTrends(report: WCBReport, startY: number): number {
    let y = this.writeSectionTitle('Pain Trends', startY);

    y = this.writeParagraph(`Average Pain Level: ${report.painTrends.average.toFixed(1)}/10`, y);

    if (Object.keys(report.painTrends.locations).length === 0) {
      return this.writeParagraph('No pain location data recorded.', y);
    }

    y = this.writeParagraph('Common Pain Locations:', y);

    const locationData = Object.entries(report.painTrends.locations)
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .map(([location, count]) => [location, String(count)]);

    y = this.ensureSpace(y, 30);
    this.doc!.autoTable({
      startY: y,
      head: [['Location', 'Occurrences']],
      body: locationData,
      margin: { left: this.marginX, right: this.marginX },
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    return (this.doc!.lastAutoTable?.finalY ?? y) + 12;
  }

  private addWorkImpact(report: WCBReport, startY: number): number {
    let y = this.writeSectionTitle('Work Impact', startY);

    y = this.writeParagraph(`Missed Work Days: ${report.workImpact.missedDays}`, y);

    if (report.workImpact.limitations.length > 0) {
      y = this.writeParagraph('Work Limitations:', y);

      const limitationData = report.workImpact.limitations.map(([limitation, frequency]) => [
        limitation,
        frequency.toString(),
      ]);

      y = this.ensureSpace(y, 30);
      this.doc!.autoTable({
        startY: y,
        head: [['Limitation', 'Frequency']],
        body: limitationData,
        margin: { left: this.marginX, right: this.marginX },
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [231, 76, 60] },
      });

      y = (this.doc!.lastAutoTable?.finalY ?? y) + 12;
    }

    if (report.workImpact.accommodationsNeeded.length > 0) {
      y = this.writeParagraph('Workplace Accommodations Needed:', y);

      const accommodationData = report.workImpact.accommodationsNeeded.map((acc) => [acc]);

      y = this.ensureSpace(y, 30);
      this.doc!.autoTable({
        startY: y,
        head: [['Accommodation']],
        body: accommodationData,
        margin: { left: this.marginX, right: this.marginX },
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [46, 204, 113] },
      });

      y = (this.doc!.lastAutoTable?.finalY ?? y) + 12;
    }

    return y;
  }

  private addFunctionalAnalysis(report: WCBReport, startY: number): number {
    let y = this.writeSectionTitle('Functional Analysis', startY);

    if (report.functionalAnalysis.limitations.length > 0) {
      y = this.writeParagraph('Functional Limitations:', y);

      const limitationData = report.functionalAnalysis.limitations.map((lim) => [lim]);

      y = this.ensureSpace(y, 30);
      this.doc!.autoTable({
        startY: y,
        head: [['Limitation']],
        body: limitationData,
        margin: { left: this.marginX, right: this.marginX },
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [155, 89, 182] },
      });

      y = (this.doc!.lastAutoTable?.finalY ?? y) + 12;
    }

    if (
      report.functionalAnalysis.deterioration.length > 0 ||
      report.functionalAnalysis.improvements.length > 0
    ) {
      y = this.writeParagraph('Changes Over Time:', y);

      const changes = [
        ...report.functionalAnalysis.deterioration.map((change) => ['Deterioration', change]),
        ...report.functionalAnalysis.improvements.map((change) => ['Improvement', change]),
      ];

      y = this.ensureSpace(y, 30);
      this.doc!.autoTable({
        startY: y,
        head: [['Type', 'Description']],
        body: changes,
        margin: { left: this.marginX, right: this.marginX },
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [230, 126, 34] },
      });

      y = (this.doc!.lastAutoTable?.finalY ?? y) + 12;
    }

    return y;
  }

  private addTreatments(report: WCBReport, startY: number): number {
    let y = this.writeSectionTitle('Treatments', startY);

    if (report.treatments.current.length > 0) {
      y = this.writeParagraph('Current Treatments:', y);

      const treatmentData = report.treatments.current.map((treatment) => [
        treatment.treatment,
        treatment.frequency.toString(),
      ]);

      y = this.ensureSpace(y, 30);
      this.doc!.autoTable({
        startY: y,
        head: [['Treatment', 'Frequency']],
        body: treatmentData,
        margin: { left: this.marginX, right: this.marginX },
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [26, 188, 156] },
      });

      y = (this.doc!.lastAutoTable?.finalY ?? y) + 12;
    }

    return this.writeParagraph(`Treatment Effectiveness: ${report.treatments.effectiveness}`, y);
  }

  private addRecommendations(report: WCBReport, startY: number): number {
    let y = this.writeSectionTitle('Recommendations', startY);

    this.doc!.setFontSize(this.contentFontSize);
    this.doc!.setFont('helvetica', 'normal');

    const contentWidth = this.getContentWidth();
    const bulletIndent = 8;
    const textX = this.marginX + bulletIndent;
    const maxTextWidth = contentWidth - bulletIndent;

    report.recommendations.forEach((recommendation, index) => {
      y = this.ensureSpace(y, 18);
      const lines = this.doc!.splitTextToSize(recommendation, maxTextWidth);
      this.doc!.text(`${index + 1}.`, this.marginX, y);
      this.doc!.text(lines, textX, y);
      y += lines.length * 5 + 4;
    });

    return y;
  }

  private addFooter(): void {
    const pageCount = this.doc!.getNumberOfPages();
    const { height, width } = this.getPageSize();

    for (let page = 1; page <= pageCount; page++) {
      this.doc!.setPage(page);
      this.doc!.setFontSize(8);
      this.doc!.setFont('helvetica', 'italic');
      this.doc!.setTextColor(90);

      this.doc!.text('Generated by Pain Tracker Pro', this.marginX, height - 12);
      this.doc!.text(`Page ${page} of ${pageCount}`, width - this.marginX, height - 12, {
        align: 'right',
      } as unknown as Record<string, unknown>);
    }

    this.doc!.setTextColor(0);
  }
}

// Export factory function for lazy initialization
export function getPDFExportService(): PDFExportService {
  return new PDFExportService();
}

// Legacy export for backward compatibility (lazy instantiated)
let _instance: PDFExportService | null = null;
export const pdfExportService = {
  get instance(): PDFExportService {
    if (!_instance) {
      _instance = new PDFExportService();
    }
    return _instance;
  },
  downloadWCBReport: async (report: WCBReport, filename?: string) => {
    if (!_instance) {
      _instance = new PDFExportService();
    }
    return _instance.downloadWCBReport(report, filename);
  },
  generateWCBReport: async (report: WCBReport) => {
    if (!_instance) {
      _instance = new PDFExportService();
    }
    return _instance.generateWCBReport(report);
  },
};

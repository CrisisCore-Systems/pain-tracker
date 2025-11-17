import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { PainEntry, ReportTemplate } from '../types';
import { formatNumber } from './formatting';

interface JSDocWithAutoTable extends jsPDF {
  // jspdf-autotable typings vary between versions; allow flexible access
  autoTable: (options: any) => any;
  lastAutoTable?: { finalY: number };
}

interface DateRange {
  start: string;
  end: string;
}

interface PDFSection {
  id: string;
  title: string;
  type: string;
  dataSource: string;
  config: Record<string, unknown>;
}

export interface PDFReportOptions {
  template: ReportTemplate;
  entries: PainEntry[];
  dateRange: { start: string; end: string };
  includeCharts?: boolean;
  includeRawData?: boolean;
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private options: PDFReportOptions;

  constructor(options: PDFReportOptions) {
    this.doc = new jsPDF();
    this.options = options;
  }

  async generate(): Promise<Blob> {
    this.addHeader();
    this.addSummary();
    this.addDetailedSections();
    if (this.options.includeRawData) {
      this.addRawData();
    }
    this.addFooter();

    return this.doc.output('blob');
  }

  private addHeader(): void {
    const { template, dateRange } = this.options;

    // Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Pain Tracker Report', 20, 30);

    // Template info
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(template.name, 20, 45);

    // Date range
    this.doc.setFontSize(10);
    this.doc.text(
      `Period: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`,
      20,
      55
    );

    // Generated date
    this.doc.text(
      `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      20,
      62
    );

    // Add a line separator
    this.doc.line(20, 70, 190, 70);
  }

  private addSummary(): void {
    const { entries, dateRange } = this.options;

    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return entryDate >= startDate && entryDate <= endDate;
    });

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Summary', 20, 85);

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');

    let yPos = 95;

    // Basic statistics
    const avgPain =
      filteredEntries.length > 0
        ? filteredEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) /
          filteredEntries.length
        : 0;

    const mostCommonLocation = this.getMostCommon(
      filteredEntries.flatMap(e => e.baselineData.locations || [])
    );
    const mostCommonSymptom = this.getMostCommon(
      filteredEntries.flatMap(e => e.baselineData.symptoms || [])
    );

    this.doc.text(`Total Entries: ${filteredEntries.length}`, 20, yPos);
    yPos += 8;
    this.doc.text(`Average Pain Level: ${formatNumber(avgPain, 1)}/10`, 20, yPos);
    yPos += 8;
    this.doc.text(`Most Common Location: ${mostCommonLocation}`, 20, yPos);
    yPos += 8;
    this.doc.text(`Most Common Symptom: ${mostCommonSymptom}`, 20, yPos);
    yPos += 8;

    // Pain level distribution
    const painDistribution = this.getPainDistribution(filteredEntries);
    this.doc.text('Pain Level Distribution:', 20, yPos + 5);

    yPos += 15;
    Object.entries(painDistribution).forEach(([level, count]) => {
      this.doc.text(`Level ${level}: ${count} entries`, 30, yPos);
      yPos += 6;
    });
  }

  private addDetailedSections(): void {
    const { template, entries, dateRange } = this.options;

    let yPos = 160;

    template.sections.forEach((section: unknown) => {
      const pdfSection = section as PDFSection;

      if (yPos > 250) {
        this.doc.addPage();
        yPos = 30;
      }

      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(pdfSection.title, 20, yPos);
      yPos += 10;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');

      switch (pdfSection.type) {
        case 'metrics':
          yPos = this.addMetricsSection(pdfSection, entries, dateRange, yPos);
          break;
        case 'table':
          yPos = this.addTableSection(pdfSection, entries, dateRange, yPos);
          break;
        case 'text':
          yPos = this.addTextSection(pdfSection, entries, dateRange, yPos);
          break;
        default:
          this.doc.text(`[Chart: ${pdfSection.dataSource}]`, 20, yPos);
          yPos += 10;
      }

      yPos += 15;
    });
  }

  private addMetricsSection(
    section: PDFSection,
    entries: PainEntry[],
    dateRange: DateRange,
    yPos: number
  ): number {
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return entryDate >= startDate && entryDate <= endDate;
    });

    switch (section.dataSource) {
      case 'medications': {
        const medications = new Set(
          filteredEntries.flatMap(e => e.medications?.current?.map(m => m.name) || [])
        );
        this.doc.text(`Total Unique Medications: ${medications.size}`, 20, yPos);
        yPos += 8;
        Array.from(medications)
          .slice(0, 5)
          .forEach(med => {
            this.doc.text(`• ${med}`, 30, yPos);
            yPos += 6;
          });
        break;
      }
      case 'progress': {
        const avgPain =
          filteredEntries.length > 0
            ? filteredEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) /
              filteredEntries.length
            : 0;
        this.doc.text(`Average Pain Level: ${formatNumber(avgPain, 1)}/10`, 20, yPos);
        yPos += 8;
        this.doc.text(`Total Entries: ${filteredEntries.length}`, 20, yPos);
        yPos += 8;
        break;
      }
    }

    return yPos;
  }

  private addTableSection(
    section: PDFSection,
    entries: PainEntry[],
    dateRange: DateRange,
    yPos: number
  ): number {
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return entryDate >= startDate && entryDate <= endDate;
    });

    switch (section.dataSource) {
      case 'symptoms': {
        const symptomCounts = this.getSymptomCounts(filteredEntries);
        const topSymptoms = Object.entries(symptomCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10);

        if (topSymptoms.length > 0) {
          const tableData = topSymptoms.map(([symptom, count]) => [symptom, count.toString()]);

          (this.doc as unknown as JSDocWithAutoTable).autoTable({
            startY: yPos,
            head: [['Symptom', 'Frequency']],
            body: tableData,
            margin: { left: 20 },
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 139, 202] },
          });

          yPos = ((this.doc as unknown as JSDocWithAutoTable).lastAutoTable?.finalY ?? yPos) + 10;
        }
        break;
      }
    }

    return yPos;
  }

  private addTextSection(
    section: PDFSection,
    entries: PainEntry[],
    dateRange: DateRange,
    yPos: number
  ): number {
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return entryDate >= startDate && entryDate <= endDate;
    });

    switch (section.dataSource) {
      case 'overview': {
        this.doc.text(
          `Report covers ${filteredEntries.length} pain entries from ${new Date(dateRange.start).toLocaleDateString()} to ${new Date(dateRange.end).toLocaleDateString()}.`,
          20,
          yPos
        );
        yPos += 8;
        break;
      }
      case 'treatments': {
        const treatments = new Set(
          filteredEntries.flatMap(e => e.treatments?.recent?.map(t => t.type) || [])
        );
        this.doc.text(`Treatments received: ${Array.from(treatments).join(', ')}`, 20, yPos);
        yPos += 8;
        break;
      }
    }

    return yPos;
  }

  private addRawData(): void {
    const { entries, dateRange } = this.options;

    this.doc.addPage();
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Raw Data', 20, 30);

    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return entryDate >= startDate && entryDate <= endDate;
    });

    const tableData = filteredEntries.map(entry => [
      new Date(entry.timestamp).toLocaleDateString(),
      entry.baselineData.pain.toString(),
      (entry.baselineData.locations || []).join(', '),
      (entry.baselineData.symptoms || []).join(', '),
      (entry.notes || '').substring(0, 50) + ((entry.notes || '').length > 50 ? '...' : ''),
    ]);

    (this.doc as unknown as JSDocWithAutoTable).autoTable({
      startY: 40,
      head: [['Date', 'Pain Level', 'Locations', 'Symptoms', 'Notes']],
      body: tableData,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 7 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 55 },
      },
    });
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Page ${i} of ${pageCount} - Generated by Pain Tracker Pro`,
        20,
        this.doc.internal.pageSize.height - 10
      );
    }
  }

  private getMostCommon(items: string[]): string {
    if (items.length === 0) return 'None';

    const counts = items.reduce(
      (acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0];
  }

  private getPainDistribution(entries: PainEntry[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    entries.forEach(entry => {
      const level = entry.baselineData.pain.toString();
      distribution[level] = (distribution[level] || 0) + 1;
    });

    return distribution;
  }

  private getSymptomCounts(entries: PainEntry[]): Record<string, number> {
    const counts: Record<string, number> = {};

    entries.forEach(entry => {
      (entry.baselineData.symptoms || []).forEach(symptom => {
        counts[symptom] = (counts[symptom] || 0) + 1;
      });
    });

    return counts;
  }
}

export async function generatePDFReport(options: PDFReportOptions): Promise<Blob> {
  const generator = new PDFReportGenerator(options);
  return generator.generate();
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

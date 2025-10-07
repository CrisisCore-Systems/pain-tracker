import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PainEntry, MoodEntry } from '../types/pain-tracker';

const getPainIntensity = (entry: PainEntry): number =>
  entry.intensity ?? entry.baselineData?.pain ?? 0;

const getPainLocation = (entry: PainEntry): string | undefined =>
  entry.location ?? entry.baselineData?.locations?.join(', ');

const getPainQuality = (entry: PainEntry): string[] =>
  entry.quality ?? entry.baselineData?.symptoms ?? [];

interface PatientInfo {
  name?: string;
  dateOfBirth?: string;
  patientId?: string;
  claimNumber?: string; // WorkSafe BC
  injuryDate?: string; // WorkSafe BC
  physicianName?: string;
  physicianPhone?: string;
}

interface ChartDataURL {
  painTrend?: string;
  painDistribution?: string;
  symptomFrequency?: string;
}

interface PDFExportOptions {
  patientInfo?: PatientInfo;
  entries: PainEntry[];
  moodEntries?: MoodEntry[];
  dateRange?: { start: Date; end: Date };
  charts?: ChartDataURL;
  includeNarrative?: boolean;
  wcbCompliant?: boolean; // WorkSafe BC specific formatting
  clinicalNotes?: string;
}

interface PDFMetadata {
  title: string;
  subject: string;
  author: string;
  keywords: string;
  creator: string;
}

/**
 * Clinical PDF Exporter Service
 * 
 * Generates comprehensive clinical reports with:
 * - WorkSafe BC compliance formatting
 * - Embedded charts and visualizations
 * - Narrative timeline with clinical context
 * - Statistical summaries and trend analysis
 * - HIPAA-compliant headers and footers
 */
export class ClinicalPDFExporter {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin = 20;
  private currentY = 20;
  private lineHeight = 7;
  private readonly primaryColor = '#2563eb';
  private readonly secondaryColor = '#64748b';
  private readonly accentColor = '#10b981';

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  /**
   * Generate a comprehensive clinical PDF report
   */
  async generateReport(options: PDFExportOptions): Promise<Blob> {
    this.setupMetadata(options);
    
    // Header and patient info
    this.addHeader(options.wcbCompliant || false);
    this.addPatientInformation(options.patientInfo);
    
    // Executive summary
    this.addExecutiveSummary(options.entries, options.moodEntries);
    
    // Charts and visualizations
    if (options.charts) {
      await this.addCharts(options.charts);
    }
    
    // Pain entry table
    this.addPainEntryTable(options.entries, options.dateRange);
    
    // Narrative timeline
    if (options.includeNarrative) {
      this.addNarrativeTimeline(options.entries, options.moodEntries);
    }
    
    // Clinical notes
    if (options.clinicalNotes) {
      this.addClinicalNotes(options.clinicalNotes);
    }
    
    // WorkSafe BC specific sections
    if (options.wcbCompliant) {
      this.addWCBComplianceSections(options.patientInfo);
    }
    
    // Footer on all pages
    this.addFooters();
    
    return this.doc.output('blob');
  }

  /**
   * Set PDF metadata for HIPAA compliance
   */
  private setupMetadata(options: PDFExportOptions): void {
    const metadata: PDFMetadata = {
      title: 'Clinical Pain Management Report',
      subject: `Pain tracking report for ${options.dateRange?.start ? `${options.dateRange.start.toLocaleDateString()} to ${options.dateRange.end?.toLocaleDateString()}` : 'All time'}`,
      author: options.patientInfo?.physicianName || 'Pain Tracker Clinical System',
      keywords: 'pain management, clinical report, chronic pain, WorkSafe BC',
      creator: 'Pain Tracker v3.0 - Clinical Module',
    };

    this.doc.setProperties(metadata);
  }

  /**
   * Add clinical header with branding and confidentiality notice
   */
  private addHeader(wcbCompliant: boolean): void {
    // Logo/Branding area
    this.doc.setFontSize(20);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Clinical Pain Management Report', this.margin, this.currentY);
    
    // Confidentiality notice
    this.currentY += 10;
    this.doc.setFontSize(9);
    this.doc.setTextColor(200, 0, 0);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CONFIDENTIAL MEDICAL RECORD', this.margin, this.currentY);
    
    this.currentY += 5;
    this.doc.setFontSize(8);
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      'This document contains protected health information (PHI). Unauthorized disclosure is prohibited.',
      this.margin,
      this.currentY
    );
    
    if (wcbCompliant) {
      this.currentY += 4;
      this.doc.setTextColor(this.primaryColor);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('WorkSafe BC Claim Documentation', this.margin, this.currentY);
    }
    
    // Date generated
    this.doc.setFontSize(9);
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      this.pageWidth - this.margin - 50,
      20,
      { align: 'right' }
    );
    
    // Divider line
    this.currentY += 8;
    this.doc.setDrawColor(this.secondaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 10;
  }

  /**
   * Add patient demographics and claim information
   */
  private addPatientInformation(info?: PatientInfo): void {
    if (!info) return;

    this.checkPageBreak(40);
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Patient Information', this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    
    const fields: Array<[string, string | undefined]> = [
      ['Name:', info.name],
      ['Date of Birth:', info.dateOfBirth],
      ['Patient ID:', info.patientId],
      ['Claim Number:', info.claimNumber],
      ['Injury Date:', info.injuryDate],
      ['Physician:', info.physicianName],
      ['Physician Contact:', info.physicianPhone],
    ];
    
    fields.forEach(([label, value]) => {
      if (value) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(label, this.margin, this.currentY);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(value, this.margin + 45, this.currentY);
        this.currentY += this.lineHeight;
      }
    });
    
    this.currentY += 5;
  }

  /**
   * Add executive summary with key metrics
   */
  private addExecutiveSummary(entries: PainEntry[], moodEntries?: MoodEntry[]): void {
    this.checkPageBreak(60);
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Executive Summary', this.margin, this.currentY);
    
    this.currentY += 8;
    
    // Calculate statistics
    const avgPain = entries.reduce((sum, e) => sum + getPainIntensity(e), 0) / entries.length;
    const maxPain = Math.max(...entries.map(getPainIntensity));
    const minPain = Math.min(...entries.map(getPainIntensity));
    const totalEntries = entries.length;
    
    const dateRange = entries.length > 0 
      ? `${new Date(entries[0].timestamp).toLocaleDateString()} to ${new Date(entries[entries.length - 1].timestamp).toLocaleDateString()}`
      : 'No data';
    
    // Summary box
    this.doc.setFillColor(245, 247, 250);
    this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 45, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    
    const summaryData = [
      ['Reporting Period:', dateRange],
      ['Total Pain Entries:', `${totalEntries} recordings`],
      ['Average Pain Level:', `${avgPain.toFixed(1)}/10 (${this.getPainCategory(avgPain)})`],
      ['Pain Range:', `${minPain} - ${maxPain}/10`],
      ['Mood Entries:', moodEntries ? `${moodEntries.length} recordings` : 'N/A'],
    ];
    
    summaryData.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, this.margin + 5, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, this.margin + 55, this.currentY);
      this.currentY += this.lineHeight;
    });
    
    this.currentY += 8;
  }

  /**
   * Embed chart images from canvas data URLs
   */
  private async addCharts(charts: ChartDataURL): Promise<void> {
    this.checkPageBreak(120);
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Pain Trend Analysis', this.margin, this.currentY);
    
    this.currentY += 10;
    
    const chartWidth = this.pageWidth - 2 * this.margin;
    const chartHeight = 60;
    
    if (charts.painTrend) {
      try {
        this.doc.addImage(charts.painTrend, 'PNG', this.margin, this.currentY, chartWidth, chartHeight);
        this.currentY += chartHeight + 5;
        
        this.doc.setFontSize(9);
        this.doc.setTextColor(this.secondaryColor);
        this.doc.text('Figure 1: Pain intensity trends over reporting period', this.margin, this.currentY);
        this.currentY += 10;
      } catch (error) {
        console.error('Failed to embed pain trend chart:', error);
      }
    }
    
    this.checkPageBreak(80);
    
    if (charts.painDistribution) {
      try {
        this.doc.addImage(charts.painDistribution, 'PNG', this.margin, this.currentY, chartWidth, chartHeight);
        this.currentY += chartHeight + 5;
        
        this.doc.setFontSize(9);
        this.doc.setTextColor(this.secondaryColor);
        this.doc.text('Figure 2: Pain level distribution and frequency analysis', this.margin, this.currentY);
        this.currentY += 10;
      } catch (error) {
        console.error('Failed to embed pain distribution chart:', error);
      }
    }
  }

  /**
   * Add detailed pain entry table
   */
  private addPainEntryTable(entries: PainEntry[], dateRange?: { start: Date; end: Date }): void {
    this.checkPageBreak(40);
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Detailed Pain Log', this.margin, this.currentY);
    
    this.currentY += 8;
    
    // Filter entries by date range if provided
    let filteredEntries = entries;
    if (dateRange) {
      filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= dateRange.start && entryDate <= dateRange.end;
      });
    }
    
    // Prepare table data
    const tableData = filteredEntries.slice(0, 50).map(entry => [
      new Date(entry.timestamp).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      getPainIntensity(entry).toString(),
      getPainLocation(entry) || 'Not specified',
      getPainQuality(entry).join(', ') || 'N/A',
      entry.triggers?.join(', ') || 'None noted',
    ]);
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Date/Time', 'Level', 'Location', 'Quality', 'Triggers']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235], // Primary color
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      margin: { left: this.margin, right: this.margin },
      didDrawPage: (data) => {
        this.currentY = data.cursor?.y || this.currentY;
      },
    });
    
    this.currentY += 10;
    
    if (filteredEntries.length > 50) {
      this.doc.setFontSize(9);
      this.doc.setTextColor(this.secondaryColor);
      this.doc.text(
        `Note: Showing most recent 50 of ${filteredEntries.length} total entries`,
        this.margin,
        this.currentY
      );
      this.currentY += 10;
    }
  }

  /**
   * Add narrative clinical timeline
   */
  private addNarrativeTimeline(entries: PainEntry[], moodEntries?: MoodEntry[]): void {
    this.checkPageBreak(40);
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Clinical Narrative Timeline', this.margin, this.currentY);
    
    this.currentY += 8;
    
    // Generate narrative from entries
    const recentEntries = entries.slice(-10);
    
    recentEntries.forEach((entry, index) => {
      this.checkPageBreak(30);
      
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Date header
      this.doc.setFontSize(10);
      this.doc.setTextColor(this.primaryColor);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${dateStr} at ${timeStr}`, this.margin, this.currentY);
      
      this.currentY += 6;
      
      // Narrative text
      this.doc.setFontSize(9);
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont('helvetica', 'normal');
      
      const narrative = this.generateEntryNarrative(entry);
      const lines = this.doc.splitTextToSize(narrative, this.pageWidth - 2 * this.margin - 10);
      
      lines.forEach((line: string) => {
        this.checkPageBreak(10);
        this.doc.text(line, this.margin + 5, this.currentY);
        this.currentY += 5;
      });
      
      this.currentY += 3;
      
      // Divider
      if (index < recentEntries.length - 1) {
        this.doc.setDrawColor(220, 220, 220);
        this.doc.setLineWidth(0.3);
        this.doc.line(this.margin + 5, this.currentY, this.pageWidth - this.margin - 5, this.currentY);
        this.currentY += 5;
      }
    });
    
    this.currentY += 5;
  }

  /**
   * Generate narrative text from pain entry
   */
  private generateEntryNarrative(entry: PainEntry): string {
    const parts: string[] = [];
    
    // Pain intensity
    const intensity = getPainIntensity(entry);
    const painCategory = this.getPainCategory(intensity);
    parts.push(`Patient reported ${painCategory.toLowerCase()} pain (${intensity}/10)`);

    // Location
    const location = getPainLocation(entry);
    if (location) {
      parts.push(`in ${location}`);
    }

    // Quality descriptors
    const quality = getPainQuality(entry);
    if (quality.length > 0) {
      parts.push(`described as ${quality.join(', ')}`);
    }
    
    // Triggers
    if (entry.triggers && entry.triggers.length > 0) {
      parts.push(`Triggers identified: ${entry.triggers.join(', ')}`);
    }
    
    // Relief methods
    if (entry.reliefMethods && entry.reliefMethods.length > 0) {
      parts.push(`Relief attempted with: ${entry.reliefMethods.join(', ')}`);
    }
    
    // Notes
    if (entry.notes) {
      parts.push(`Additional notes: "${entry.notes}"`);
    }
    
    return parts.join('. ') + '.';
  }

  /**
   * Add clinical notes section
   */
  private addClinicalNotes(notes: string): void {
    this.checkPageBreak(40);
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Clinical Notes & Observations', this.margin, this.currentY);
    
    this.currentY += 8;
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    
    const lines = this.doc.splitTextToSize(notes, this.pageWidth - 2 * this.margin);
    
    lines.forEach((line: string) => {
      this.checkPageBreak(10);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
    
    this.currentY += 5;
  }

  /**
   * Add WorkSafe BC compliance sections
   */
  private addWCBComplianceSections(info?: PatientInfo): void {
    // Add new page for WCB declaration
    this.doc.addPage();
    this.currentY = this.margin;
    
    this.doc.setFontSize(16);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('WorkSafe BC Claim Documentation', this.margin, this.currentY);
    
    this.currentY += 12;
    
    // Claim information summary
    this.doc.setFontSize(12);
    this.doc.text('Claim Information', this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    if (info?.claimNumber) {
      this.doc.text(`Claim Number: ${info.claimNumber}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    if (info?.injuryDate) {
      this.doc.text(`Date of Injury: ${info.injuryDate}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    this.currentY += 10;
    
    // Declaration statement
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Medical Professional Declaration', this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    const declaration = 
      'I declare that the information contained in this report is true and accurate to the best of my ' +
      'knowledge and belief. This clinical documentation has been prepared in accordance with WorkSafe BC ' +
      'requirements and medical reporting standards. The patient data presented represents objective clinical ' +
      'observations and patient-reported outcomes collected during the reporting period.';
    
    const declarationLines = this.doc.splitTextToSize(declaration, this.pageWidth - 2 * this.margin);
    
    declarationLines.forEach((line: string) => {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 15;
    
    // Signature fields
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    
    // Physician signature
    this.doc.line(this.margin, this.currentY, this.margin + 80, this.currentY);
    this.currentY += 5;
    this.doc.setFontSize(9);
    this.doc.text('Physician Signature', this.margin, this.currentY);
    
    // Date
    this.doc.line(this.pageWidth - this.margin - 50, this.currentY - 5, this.pageWidth - this.margin, this.currentY - 5);
    this.doc.text('Date', this.pageWidth - this.margin - 50, this.currentY);
    
    this.currentY += 15;
    
    if (info?.physicianName) {
      this.doc.text(`Printed Name: ${info.physicianName}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    if (info?.physicianPhone) {
      this.doc.text(`Contact: ${info.physicianPhone}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    // Compliance notice
    this.currentY += 15;
    this.doc.setFillColor(255, 250, 230);
    this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 25, 'F');
    
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 0);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('WorkSafe BC Notice:', this.margin + 5, this.currentY);
    
    this.currentY += 5;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const noticeText = 
      'This report is submitted in support of a WorkSafe BC claim. The information provided is for the ' +
      'purpose of assessing and managing the claimant\'s work-related injury or illness. Any questions ' +
      'regarding this documentation should be directed to the attending physician.';
    
    const noticeLines = this.doc.splitTextToSize(noticeText, this.pageWidth - 2 * this.margin - 10);
    
    noticeLines.forEach((line: string) => {
      this.doc.text(line, this.margin + 5, this.currentY);
      this.currentY += 5;
    });
  }

  /**
   * Add footer to all pages
   */
  private addFooters(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(this.secondaryColor);
      this.doc.setLineWidth(0.3);
      this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);
      
      // Footer text
      this.doc.setFontSize(8);
      this.doc.setTextColor(this.secondaryColor);
      this.doc.setFont('helvetica', 'normal');
      
      // Left: Confidentiality
      this.doc.text(
        'Confidential Medical Record - Do Not Distribute',
        this.margin,
        this.pageHeight - 10
      );
      
      // Center: Generated by
      this.doc.text(
        'Pain Tracker Clinical System v3.0',
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
      
      // Right: Page number
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: 'right' }
      );
    }
  }

  /**
   * Check if we need a page break
   */
  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 25) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  /**
   * Categorize pain level
   */
  private getPainCategory(level: number): string {
    if (level === 0) return 'No Pain';
    if (level <= 3) return 'Mild Pain';
    if (level <= 6) return 'Moderate Pain';
    if (level <= 8) return 'Severe Pain';
    return 'Extreme Pain';
  }

  /**
   * Save PDF to file
   */
  save(filename: string): void {
    this.doc.save(filename);
  }

  /**
   * Get PDF as data URL
   */
  getDataURL(): string {
    return this.doc.output('dataurlstring');
  }
}

/**
 * Helper function to capture chart as data URL
 */
export async function captureChartAsDataURL(canvasElement: HTMLCanvasElement): Promise<string> {
  return canvasElement.toDataURL('image/png', 1.0);
}

/**
 * Quick export function for common use case
 */
export async function exportClinicalPDF(
  entries: PainEntry[],
  options?: Partial<PDFExportOptions>
): Promise<Blob> {
  const exporter = new ClinicalPDFExporter();
  return exporter.generateReport({
    entries,
    ...options,
  });
}

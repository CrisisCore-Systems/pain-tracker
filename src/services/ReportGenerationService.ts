import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

interface PatientInfo {
  id: string;
  name: string;
  dateOfBirth: string;
  claimNumber?: string;
  injuryDate?: string;
  employerName?: string;
  occupation?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface PainEntry {
  id: string;
  timestamp: string;
  painLevel: number;
  location: string;
  triggers?: string[];
  medications?: string[];
  activities?: string[];
  mood?: number;
  sleep?: number;
  notes?: string;
}

interface ClinicalNote {
  id: string;
  date: string;
  provider: string;
  type: 'assessment' | 'treatment' | 'progress' | 'referral';
  content: string;
  diagnosis?: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescriber: string;
}

export interface WorkSafeBCReport {
  reportType: 'initial' | 'progress' | 'final';
  dateRange: { start: string; end: string };
  patientInfo: PatientInfo;
  clinicalSummary: string;
  painTrend: 'improving' | 'stable' | 'worsening';
  functionalImpact: string;
  treatmentPlan: string;
  workCapacity: 'full' | 'modified' | 'unable';
  restrictions?: string[];
  recommendedDuration?: number; // days
  nextReviewDate?: string;
}

export class ReportGenerationService {
  /**
   * Generate comprehensive WorkSafe BC report
   */
  static async generateWorkSafeBCReport(
    patient: PatientInfo,
    entries: PainEntry[],
    notes: ClinicalNote[],
    medications: Medication[],
    reportType: 'initial' | 'progress' | 'final'
  ): Promise<{ pdf: jsPDF; summary: WorkSafeBCReport }> {
    const pdf = new jsPDF();
    const dateRange = {
      start: entries[0]?.timestamp || new Date().toISOString(),
      end: entries[entries.length - 1]?.timestamp || new Date().toISOString(),
    };

    // Analyze pain trend
    const painTrend = this.analyzePainTrend(entries);
    const avgPain = this.calculateAveragePain(entries);
    const functionalImpact = this.assessFunctionalImpact(entries, avgPain);
    const workCapacity = this.determineWorkCapacity(avgPain, painTrend);

    // Generate PDF
    this.addHeader(pdf, 'WorkSafe BC Medical Report', reportType);
    this.addPatientInfo(pdf, patient);
    this.addClinicalSummary(pdf, entries, notes, medications);
    this.addPainAnalysis(pdf, entries, painTrend);
    this.addFunctionalAssessment(pdf, functionalImpact, workCapacity);
    this.addTreatmentPlan(pdf, medications, notes);
    this.addProviderSignature(pdf);

    const summary: WorkSafeBCReport = {
      reportType,
      dateRange,
      patientInfo: patient,
      clinicalSummary: this.generateClinicalSummary(entries, notes),
      painTrend,
      functionalImpact,
      treatmentPlan: this.generateTreatmentPlan(medications, notes),
      workCapacity,
      restrictions: this.determineRestrictions(avgPain, painTrend),
      recommendedDuration: this.recommendDuration(painTrend),
      nextReviewDate: this.calculateNextReviewDate(reportType, painTrend),
    };

    return { pdf, summary };
  }

  /**
   * Generate insurance claim report
   */
  static async generateInsuranceReport(
    patient: PatientInfo,
    entries: PainEntry[],
    notes: ClinicalNote[],
    medications: Medication[]
  ): Promise<jsPDF> {
    const pdf = new jsPDF();

    this.addHeader(pdf, 'Medical Report for Insurance Claim', 'initial');
    this.addPatientInfo(pdf, patient);
    this.addDiagnosisSection(pdf, notes);
    this.addTreatmentHistory(pdf, entries, medications);
    this.addPrognosisSection(pdf, entries);
    this.addProviderSignature(pdf);

    return pdf;
  }

  /**
   * Generate clinical progress note
   */
  static async generateProgressNote(
    patient: PatientInfo,
    entries: PainEntry[],
    lastVisit: ClinicalNote,
    medications: Medication[]
  ): Promise<{ pdf: jsPDF; text: string }> {
    const pdf = new jsPDF();
    const recentEntries = entries.slice(-14); // Last 14 days

    const noteText = this.formatProgressNote(patient, recentEntries, lastVisit, medications);

    // Add to PDF
    this.addHeader(pdf, 'Clinical Progress Note', 'progress');
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(noteText, 180);
    pdf.text(lines, 15, 60);

    return { pdf, text: noteText };
  }

  /**
   * Export data as CSV for spreadsheet analysis
   */
  static exportToCSV(entries: PainEntry[]): string {
    const headers = [
      'Date',
      'Time',
      'Pain Level',
      'Location',
      'Triggers',
      'Activities',
      'Medications',
      'Mood',
      'Sleep',
      'Notes',
    ];

    const rows = entries.map((entry) => [
      format(new Date(entry.timestamp), 'yyyy-MM-dd'),
      format(new Date(entry.timestamp), 'HH:mm'),
      entry.painLevel,
      entry.location,
      entry.triggers?.join('; ') || '',
      entry.activities?.join('; ') || '',
      entry.medications?.join('; ') || '',
      entry.mood || '',
      entry.sleep || '',
      entry.notes?.replace(/,/g, ';') || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  }

  // Helper methods for PDF generation
  private static addHeader(pdf: jsPDF, title: string, reportType: string) {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 15, 20);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 15, 30);
    pdf.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, 15, 35);

    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, 40, 195, 40);
  }

  private static addPatientInfo(pdf: jsPDF, patient: PatientInfo) {
    let y = 50;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient Information', 15, y);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    y += 7;

    pdf.text(`Name: ${patient.name}`, 15, y);
    y += 5;
    pdf.text(`Date of Birth: ${format(new Date(patient.dateOfBirth), 'MMMM dd, yyyy')}`, 15, y);
    y += 5;

    if (patient.claimNumber) {
      pdf.text(`Claim Number: ${patient.claimNumber}`, 15, y);
      y += 5;
    }

    if (patient.injuryDate) {
      pdf.text(`Date of Injury: ${format(new Date(patient.injuryDate), 'MMMM dd, yyyy')}`, 15, y);
      y += 5;
    }

    if (patient.employerName) {
      pdf.text(`Employer: ${patient.employerName}`, 15, y);
      y += 5;
    }

    if (patient.occupation) {
      pdf.text(`Occupation: ${patient.occupation}`, 15, y);
      y += 5;
    }

    return y + 5;
  }

  private static addClinicalSummary(
    pdf: jsPDF,
    entries: PainEntry[],
    notes: ClinicalNote[],
    medications: Medication[]
  ) {
    let y = 95;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Clinical Summary', 15, y);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    y += 7;

    const summary = this.generateClinicalSummary(entries, notes);
    const lines = pdf.splitTextToSize(summary, 180);
    pdf.text(lines, 15, y);

    y += lines.length * 5 + 10;

    // Active medications
    if (medications.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Current Medications:', 15, y);
      pdf.setFont('helvetica', 'normal');
      y += 5;

      medications.forEach((med) => {
        pdf.text(`• ${med.name} ${med.dosage} - ${med.frequency}`, 20, y);
        y += 5;
      });
    }
  }

  private static addPainAnalysis(
    pdf: jsPDF,
    entries: PainEntry[],
    trend: 'improving' | 'stable' | 'worsening'
  ) {
    pdf.addPage();
    let y = 20;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pain Analysis', 15, y);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    y += 7;

    const avgPain = this.calculateAveragePain(entries);
    const maxPain = Math.max(...entries.map((e) => e.painLevel));
    const minPain = Math.min(...entries.map((e) => e.painLevel));

    pdf.text(`Average Pain Level: ${avgPain.toFixed(1)}/10`, 15, y);
    y += 5;
    pdf.text(`Pain Range: ${minPain} - ${maxPain}/10`, 15, y);
    y += 5;
    pdf.text(`Trend: ${trend.charAt(0).toUpperCase() + trend.slice(1)}`, 15, y);
    y += 5;
    pdf.text(`Data Points: ${entries.length} entries over ${this.calculateDaySpan(entries)} days`, 15, y);
  }

  private static addFunctionalAssessment(
    pdf: jsPDF,
    functionalImpact: string,
    workCapacity: 'full' | 'modified' | 'unable'
  ) {
    let y = pdf.internal.pageSize.height / 2;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Functional Assessment', 15, y);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    y += 7;

    const lines = pdf.splitTextToSize(functionalImpact, 180);
    pdf.text(lines, 15, y);

    y += lines.length * 5 + 10;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Work Capacity Assessment:', 15, y);
    pdf.setFont('helvetica', 'normal');
    y += 5;

    const capacityText =
      workCapacity === 'full'
        ? 'Patient is capable of full duties'
        : workCapacity === 'modified'
          ? 'Patient requires modified duties and restrictions'
          : 'Patient is currently unable to perform work duties';

    pdf.text(capacityText, 15, y);
  }

  private static addTreatmentPlan(pdf: jsPDF, medications: Medication[], notes: ClinicalNote[]) {
    pdf.addPage();
    let y = 20;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Treatment Plan', 15, y);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    y += 7;

    const plan = this.generateTreatmentPlan(medications, notes);
    const lines = pdf.splitTextToSize(plan, 180);
    pdf.text(lines, 15, y);
  }

  private static addProviderSignature(pdf: jsPDF) {
    const y = pdf.internal.pageSize.height - 40;

    pdf.setFontSize(10);
    pdf.text('Provider Signature: _________________________', 15, y);
    pdf.text('Date: _________________________', 15, y + 10);
    pdf.text('License Number: _________________________', 15, y + 20);
  }

  private static addDiagnosisSection(pdf: jsPDF, notes: ClinicalNote[]) {
    let y = 95;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Diagnosis', 15, y);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    y += 7;

    const diagnosisNotes = notes.filter((n) => n.diagnosis);
    if (diagnosisNotes.length > 0) {
      diagnosisNotes.forEach((note) => {
        pdf.text(`• ${note.diagnosis}`, 20, y);
        y += 5;
      });
    } else {
      pdf.text('Chronic pain condition - see clinical notes for details', 20, y);
    }
  }

  private static addTreatmentHistory(
    pdf: jsPDF,
    entries: PainEntry[],
    medications: Medication[]
  ) {
    pdf.addPage();
    let y = 20;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Treatment History', 15, y);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    y += 7;

    medications.forEach((med) => {
      pdf.text(
        `• ${med.name} ${med.dosage} started ${format(new Date(med.startDate), 'MMM dd, yyyy')}`,
        20,
        y
      );
      y += 5;
    });
  }

  private static addPrognosisSection(pdf: jsPDF, entries: PainEntry[]) {
    const y = pdf.internal.pageSize.height / 2;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Prognosis', 15, y);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const trend = this.analyzePainTrend(entries);
    const prognosis =
      trend === 'improving'
        ? 'Patient shows positive response to treatment with improving pain levels. Continued improvement expected with ongoing care.'
        : trend === 'stable'
          ? 'Patient maintains stable pain levels. Continued management required to maintain current functional status.'
          : 'Patient experiencing worsening symptoms. Treatment plan adjustment recommended.';

    const lines = pdf.splitTextToSize(prognosis, 180);
    pdf.text(lines, 15, y + 7);
  }

  // Analysis helper methods
  private static analyzePainTrend(entries: PainEntry[]): 'improving' | 'stable' | 'worsening' {
    if (entries.length < 2) return 'stable';

    const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
    const secondHalf = entries.slice(Math.floor(entries.length / 2));

    const avgFirst = this.calculateAveragePain(firstHalf);
    const avgSecond = this.calculateAveragePain(secondHalf);

    const diff = avgFirst - avgSecond;

    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'worsening';
    return 'stable';
  }

  private static calculateAveragePain(entries: PainEntry[]): number {
    if (entries.length === 0) return 0;
    return entries.reduce((sum, e) => sum + e.painLevel, 0) / entries.length;
  }

  private static assessFunctionalImpact(entries: PainEntry[], avgPain: number): string {
    if (avgPain < 3) {
      return 'Patient reports minimal functional impact. Able to perform most activities of daily living with minor limitations.';
    } else if (avgPain < 6) {
      return 'Patient experiences moderate functional impact. Some activities of daily living are affected, requiring modifications and occasional assistance.';
    } else {
      return 'Patient reports significant functional impact. Substantial limitations in activities of daily living, requiring regular assistance and accommodations.';
    }
  }

  private static determineWorkCapacity(
    avgPain: number,
    trend: 'improving' | 'stable' | 'worsening'
  ): 'full' | 'modified' | 'unable' {
    if (avgPain < 3 && trend !== 'worsening') return 'full';
    if (avgPain < 6) return 'modified';
    return 'unable';
  }

  private static determineRestrictions(
    avgPain: number,
    trend: 'improving' | 'stable' | 'worsening'
  ): string[] {
    const restrictions: string[] = [];

    if (avgPain >= 4) {
      restrictions.push('Limit prolonged standing (max 2 hours)');
      restrictions.push('Avoid heavy lifting (>10 lbs)');
    }

    if (avgPain >= 6) {
      restrictions.push('Frequent position changes required');
      restrictions.push('Avoid repetitive bending or twisting');
      restrictions.push('Modified work schedule may be required');
    }

    if (trend === 'worsening') {
      restrictions.push('Close monitoring required');
      restrictions.push('Re-evaluation in 2 weeks');
    }

    return restrictions;
  }

  private static recommendDuration(trend: 'improving' | 'stable' | 'worsening'): number {
    if (trend === 'improving') return 14; // 2 weeks
    if (trend === 'stable') return 30; // 1 month
    return 7; // 1 week for worsening
  }

  private static calculateNextReviewDate(
    reportType: string,
    trend: 'improving' | 'stable' | 'worsening'
  ): string {
    const days = this.recommendDuration(trend);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    return format(nextDate, 'yyyy-MM-dd');
  }

  private static generateClinicalSummary(entries: PainEntry[], notes: ClinicalNote[]): string {
    const avgPain = this.calculateAveragePain(entries);
    const trend = this.analyzePainTrend(entries);
    const daySpan = this.calculateDaySpan(entries);

    const summary = `Patient has been tracking pain levels over ${daySpan} days with ${entries.length} documented entries. Average pain level is ${avgPain.toFixed(1)}/10 with a ${trend} trend. ${notes.length > 0 ? `Clinical team has documented ${notes.length} clinical notes during this period.` : ''}`;

    return summary;
  }

  private static generateTreatmentPlan(medications: Medication[], notes: ClinicalNote[]): string {
    const plan = `Continue current medication regimen with ${medications.length} active medications. ${
      notes.filter((n) => n.type === 'treatment').length > 0
        ? 'Ongoing therapeutic interventions as documented in clinical notes.'
        : 'Consider additional therapeutic interventions based on pain pattern analysis.'
    } Regular monitoring and follow-up appointments recommended.`;

    return plan;
  }

  private static formatProgressNote(
    patient: PatientInfo,
    entries: PainEntry[],
    lastVisit: ClinicalNote,
    medications: Medication[]
  ): string {
    const avgPain = this.calculateAveragePain(entries);
    const trend = this.analyzePainTrend(entries);

    return `
CLINICAL PROGRESS NOTE

Patient: ${patient.name}
Date: ${format(new Date(), 'MMMM dd, yyyy')}

SUBJECTIVE:
Patient continues to track pain levels daily. Reports ${trend} pain over the past 14 days.

OBJECTIVE:
Average pain level: ${avgPain.toFixed(1)}/10
Pain trend: ${trend.charAt(0).toUpperCase() + trend.slice(1)}
Data points: ${entries.length} entries

Current medications:
${medications.map((m) => `- ${m.name} ${m.dosage} ${m.frequency}`).join('\n')}

ASSESSMENT:
${trend === 'improving' ? 'Positive response to current treatment plan.' : trend === 'stable' ? 'Stable pain management with current regimen.' : 'Suboptimal pain control, treatment adjustment needed.'}

PLAN:
${trend === 'improving' ? 'Continue current treatment plan. Follow-up in 4 weeks.' : trend === 'stable' ? 'Maintain current treatment. Monitor for changes. Follow-up in 4 weeks.' : 'Adjust treatment plan. Consider additional interventions. Follow-up in 2 weeks.'}
    `.trim();
  }

  private static calculateDaySpan(entries: PainEntry[]): number {
    if (entries.length === 0) return 0;
    const first = new Date(entries[0].timestamp);
    const last = new Date(entries[entries.length - 1].timestamp);
    return Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
  }
}

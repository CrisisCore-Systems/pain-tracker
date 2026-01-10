export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  time: string; // ISO string or "HH:mm AM/PM" for display in mock
  date: string; // YYYY-MM-DD
  duration: number; // minutes
  type: 'follow-up' | 'initial' | 'urgent' | 'check-in';
  status: 'scheduled' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  location?: 'in-person' | 'telehealth';
}

export interface Patient {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'archived';
    lastVisit: string;
    nextAppointment?: string;
    painLevelTrend: 'improving' | 'stable' | 'worsening';
}

export interface ClinicReportTemplate {
   id: string;
   name: string;
   description: string;
   format: 'PDF' | 'CSV' | 'JSON' | 'Excel';
   category: 'population' | 'compliance' | 'financial' | 'operational';
   lastRun?: string;
}

export interface GeneratedReport {
    id: string;
    name: string;
    templateId: string;
    generatedBy: string;
    date: string;
    status: 'ready' | 'processing' | 'failed';
    size: string;
    downloadUrl?: string;
}

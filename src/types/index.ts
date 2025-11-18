export interface PainEntry {
  id: number;
  timestamp: string;
  baselineData: {
    pain: number;
    locations: string[];
    symptoms: string[];
  };
  functionalImpact: {
    limitedActivities: string[];
    assistanceNeeded: string[];
    mobilityAids: string[];
  };
  medications: {
    current: Array<{
      name: string;
      dosage: string;
      frequency: string;
      effectiveness: string;
    }>;
    changes: string;
    effectiveness: string;
  };
  treatments: {
    recent: Array<{
      type: string;
      provider: string;
      date: string;
      effectiveness: string;
    }>;
    effectiveness: string;
    planned: string[];
  };
  qualityOfLife: {
    sleepQuality: number;
    moodImpact: number;
    socialImpact: string[];
  };
  workImpact: {
    missedWork: number;
    modifiedDuties: string[];
    workLimitations: string[];
  };
  comparison: {
    worseningSince: string;
    newLimitations: string[];
  };
  notes: string;
}

export interface WCBReport {
  period: {
    start: string;
    end: string;
  };
  claimInfo?: {
    claimNumber?: string;
    employerInfo?: {
      name: string;
      contact: string;
      position: string;
    };
    injuryDate: string;
    returnToWorkDate?: string;
  };
  painTrends: {
    average: number;
    progression: Array<{
      date: string;
      pain: number;
      locations: string[];
      symptoms: string[];
    }>;
    locations: Record<string, number>;
  };
  workImpact: {
    missedDays: number;
    limitations: [string, number][];
    accommodationsNeeded: string[];
  };
  functionalAnalysis: {
    limitations: string[];
    deterioration: string[];
    improvements: string[];
  };
  treatments: {
    current: Array<{
      treatment: string;
      frequency: number;
    }>;
    effectiveness: string;
  };
  recommendations: string[];
}

export interface Activity {
  timestamp: string;
  type: string;
  duration: number;
  painLevel: number;
  description: string;
  impact: 'Improved' | 'No Effect' | 'Worsened';
  triggers: string[];
}

export interface ActivityLogEntry {
  id: string | number;
  date: string;
  activities: Activity[];
  dailyNotes: string;
  overallPainLevel: number;
  restQuality: number;
  stressLevel: number;
}

export interface EmergencyContact {
  id: number;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  isHealthcareProvider: boolean;
  specialty?: string;
  address?: string;
  notes?: string;
}

export interface EmergencyProtocol {
  name: string;
  painThreshold: number;
  symptoms: string[];
  medications: Array<{
    name: string;
    dosage: string;
    instructions: string;
  }>;
  immediateActions: string[];
  contactPriority: number[]; // Array of EmergencyContact IDs in priority order
  additionalInstructions: string;
}

export interface EmergencyPanelData {
  contacts: EmergencyContact[];
  protocols: EmergencyProtocol[];
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    previousIncidents: Array<{
      date: string;
      description: string;
      outcome: string;
    }>;
  };
  currentPainLevel: number;
  lastUpdated: string;
}

// Reporting types (shared)
export interface ReportSection {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'text' | 'metrics';
  dataSource: string;
  config: Record<string, unknown>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'summary' | 'detailed' | 'clinical' | 'progress';
  sections: ReportSection[];
  createdAt: string;
  lastModified: string;
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  nextRun: string;
  lastRun?: string;
  isActive: boolean;
}

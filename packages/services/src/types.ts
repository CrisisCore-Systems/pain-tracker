export interface Treatment {
  type: string;
  provider?: string;
  date?: string;
  frequency?: string;
  effectiveness?: string;
}

export interface PainEntry {
  id?: string | number;
  timestamp: string;
  baselineData: {
    pain: number;
    locations?: string[];
    symptoms?: string[];
  };
  notes?: string;
  triggers?: string[];
  functionalImpact?: {
    limitedActivities: string[];
    assistanceNeeded: string[];
    mobilityAids: string[];
  };
  qualityOfLife?: {
    sleepQuality: number;
    moodImpact: number;
    socialImpact: string[];
  };
  workImpact?: {
    missedWork: number;
    modifiedDuties: string[];
    workLimitations: string[];
  };
  medications?: {
    current: Array<{
      name: string;
      dosage?: string;
      frequency?: string;
      effectiveness?: string;
    }>;
    changes: string;
    effectiveness: string;
  };
  treatments?: {
    recent: Treatment[];
    effectiveness: string;
    planned: string[];
  };
  comparison?: {
    worseningSince: string;
    newLimitations: string[];
  };
}

export interface WorkImpact {
  limitations: Array<[string, number]>;
  accommodationsNeeded: string[];
  missedDays?: number;
}

export interface WCBReport {
  id: string;
  createdAt: string;
  period?: {
    start: string;
    end: string;
  };
  claimInfo?: {
    claimNumber?: string;
    injuryDate?: string;
  };
  workImpact: WorkImpact;
  functionalAnalysis: {
    limitations: string[];
    deterioration: string[];
    improvements: string[];
  };
  treatments: {
    current: Array<{ treatment: string; frequency: number }>;
    effectiveness: string;
  };
  painTrends?: {
    average: number;
    progression?: Array<{
      date: string;
      pain: number;
      locations?: string[];
      symptoms?: string[];
    }>;
    locations: Record<string, number>;
  };
  recommendations: string[];
}

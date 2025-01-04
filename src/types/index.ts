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
  painTrends: {
    average: number;
    progression: Array<{
      date: string;
      pain: number;
    }>;
    locations: Record<string, number>;
  };
  functionalAnalysis: {
    limitations: string[];
    deterioration: string[];
    improvements: string[];
  };
  recommendations: string[];
}

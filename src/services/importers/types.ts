export interface HealthRecord {
  type: 'heart_rate' | 'step_count' | 'sleep_analysis' | 'hrv';
  value: number;
  unit: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  sourceName?: string;
}

export interface ImportResult {
  records: HealthRecord[];
  errors: string[];
  summary: {
    totalRecords: number;
    dateRange: { start: string; end: string } | null;
  };
}

export interface HealthDataParser {
  name: string;
  validateFile: (file: File) => boolean;
  parse: (file: File, onProgress: (percent: number) => void) => Promise<ImportResult>;
}

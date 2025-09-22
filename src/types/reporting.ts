export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'summary' | 'detailed' | 'clinical' | 'progress';
  sections: ReportSection[];
  createdAt: string;
  lastModified: string;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'text' | 'metrics';
  dataSource: string;
  config: Record<string, unknown>;
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

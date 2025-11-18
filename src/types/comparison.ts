import type { PainEntry } from '../types';

/**
 * Data Comparison Types and Interfaces
 * Supports comparing pain data across different dimensions
 */

export type ComparisonType =
  | 'time-period'
  | 'treatment'
  | 'condition'
  | 'medication'
  | 'activity'
  | 'weather'
  | 'custom';

export type ComparisonMode =
  | 'overlay'
  | 'side-by-side'
  | 'difference'
  | 'percentage-change'
  | 'trend-analysis';

export type TimePeriodType =
  | 'day-to-day'
  | 'week-to-week'
  | 'month-to-month'
  | 'year-to-year'
  | 'custom-range';

export type StatisticalMeasureType =
  | 'mean'
  | 'median'
  | 'mode'
  | 'standard-deviation'
  | 'variance'
  | 'min'
  | 'max'
  | 'range'
  | 'percentile-25'
  | 'percentile-75'
  | 'percentile-95';

export interface StatisticalMeasure {
  type: StatisticalMeasureType;
  value: number;
}

export interface ComparisonDataset {
  id: string;
  name: string;
  description?: string;
  entries: PainEntry[];
  color: string;
  metadata: {
    source?: string;
    filter?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    [key: string]: unknown;
  };
}

export interface TimePeriodComparison {
  type: 'time-period';
  periodType: TimePeriodType;
  baselinePeriod: {
    start: Date;
    end: Date;
  };
  comparisonPeriod: {
    start: Date;
    end: Date;
  };
  datasets: ComparisonDataset[];
}

export interface TreatmentComparison {
  type: 'treatment';
  treatmentName: string;
  beforeTreatment: {
    start: Date;
    end: Date;
    entries: PainEntry[];
  };
  afterTreatment: {
    start: Date;
    end: Date;
    entries: PainEntry[];
  };
  treatmentDate: Date;
  datasets: ComparisonDataset[];
}

export interface ConditionComparison {
  type: 'condition';
  conditionName: string;
  conditionTags: string[];
  baselineCondition?: string;
  comparisonCondition: string;
  datasets: ComparisonDataset[];
}

export interface MedicationComparison {
  type: 'medication';
  medicationName: string;
  dosage?: string;
  beforeMedication: {
    start: Date;
    end: Date;
    entries: PainEntry[];
  };
  afterMedication: {
    start: Date;
    end: Date;
    entries: PainEntry[];
  };
  startDate: Date;
  datasets: ComparisonDataset[];
}

export interface ActivityComparison {
  type: 'activity';
  activityType: string;
  activityLevel: 'low' | 'moderate' | 'high';
  beforeActivity: {
    start: Date;
    end: Date;
    entries: PainEntry[];
  };
  duringActivity: {
    start: Date;
    end: Date;
    entries: PainEntry[];
  };
  afterActivity: {
    start: Date;
    end: Date;
    entries: PainEntry[];
  };
  datasets: ComparisonDataset[];
}

export interface WeatherComparison {
  type: 'weather';
  weatherCondition: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  datasets: ComparisonDataset[];
}

export interface CustomComparison {
  type: 'custom';
  customCriteria: {
    comparisonType?: string;
    filters?: ComparisonFilter;
    groupBy?: string;
    [key: string]: unknown;
  };
  datasets: ComparisonDataset[];
}

export type ComparisonConfig =
  | TimePeriodComparison
  | TreatmentComparison
  | ConditionComparison
  | MedicationComparison
  | ActivityComparison
  | WeatherComparison
  | CustomComparison;

export interface ComparisonResult {
  id: string;
  config: ComparisonConfig;
  statistics: ComparisonStatistics;
  insights: ComparisonInsight[];
  charts: ComparisonChart[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComparisonStatistics {
  overall: {
    baselineMean: number;
    comparisonMean: number;
    difference: number;
    percentageChange: number;
    statisticalSignificance: number;
    effectSize: number;
  };
  byMetric: {
    pain: StatisticalComparison;
    mood?: StatisticalComparison;
    sleep?: StatisticalComparison;
    energy?: StatisticalComparison;
    stress?: StatisticalComparison;
  };
  trends: {
    baselineTrend: number;
    comparisonTrend: number;
    trendDifference: number;
  };
}

export interface StatisticalComparison {
  baseline: StatisticalMeasure[];
  comparison: StatisticalMeasure[];
  difference: number;
  percentageChange: number;
  confidence: number;
}

export interface ComparisonInsight {
  id: string;
  type: 'improvement' | 'worsening' | 'no-change' | 'pattern' | 'correlation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  recommendation?: string;
}

export interface ComparisonChart {
  id: string;
  type: 'line' | 'bar' | 'scatter' | 'box-plot' | 'histogram';
  title: string;
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      fill?: boolean;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  config: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      legend?: {
        display?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
      };
      tooltip?: {
        enabled?: boolean;
      };
      [key: string]: unknown;
    };
    scales?: {
      x?: {
        type?: string;
        title?: {
          display?: boolean;
          text?: string;
        };
      };
      y?: {
        type?: string;
        beginAtZero?: boolean;
        title?: {
          display?: boolean;
          text?: string;
        };
      };
    };
    [key: string]: unknown;
  };
}

export interface ComparisonFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  painLevel?: {
    min: number;
    max: number;
  };
  tags?: string[];
  conditions?: string[];
  treatments?: string[];
  medications?: string[];
  activities?: string[];
}

export interface ComparisonPreset {
  id: string;
  name: string;
  description: string;
  config: ComparisonConfig;
  category: string;
  isDefault?: boolean;
}

// Default comparison presets
export const DEFAULT_COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: 'last-week-vs-this-week',
    name: 'Last Week vs This Week',
    description: 'Compare pain patterns between last week and this week',
    category: 'time-period',
    config: {
      type: 'time-period',
      periodType: 'week-to-week',
      baselinePeriod: {
        start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      comparisonPeriod: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      datasets: [],
    } as TimePeriodComparison,
  },
  {
    id: 'before-after-treatment',
    name: 'Before/After Treatment',
    description: 'Compare pain levels before and after a treatment',
    category: 'treatment',
    config: {
      type: 'treatment',
      treatmentName: 'Treatment',
      beforeTreatment: {
        start: new Date(),
        end: new Date(),
        entries: [],
      },
      afterTreatment: {
        start: new Date(),
        end: new Date(),
        entries: [],
      },
      treatmentDate: new Date(),
      datasets: [],
    } as TreatmentComparison,
  },
  {
    id: 'weekend-vs-weekday',
    name: 'Weekend vs Weekday',
    description: 'Compare pain patterns between weekends and weekdays',
    category: 'custom',
    config: {
      type: 'custom',
      customCriteria: {
        comparisonType: 'weekend-weekday',
      },
      datasets: [],
    } as CustomComparison,
  },
];

export interface ComparisonSettings {
  defaultMode: ComparisonMode;
  defaultChartType: ComparisonChart['type'];
  showConfidenceIntervals: boolean;
  statisticalSignificance: number;
  maxDatasets: number;
  autoRefresh: boolean;
  refreshInterval: number;
}

export const DEFAULT_COMPARISON_SETTINGS: ComparisonSettings = {
  defaultMode: 'overlay',
  defaultChartType: 'line',
  showConfidenceIntervals: true,
  statisticalSignificance: 0.05,
  maxDatasets: 5,
  autoRefresh: false,
  refreshInterval: 300000, // 5 minutes
};

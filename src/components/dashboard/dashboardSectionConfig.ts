import { Sun, LineChart, ClipboardList } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WidgetType } from './constants';

export type DashboardSection = 'overview' | 'insights' | 'reports';

export const SECTION_WIDGETS: Record<DashboardSection, WidgetType[]> = {
  overview: [
    'dashboard-overview',
    'pain-entry',
    'goal-tracking',
    'current-stats',
    'recent-history',
    'quick-actions',
  ],
  insights: [
    'pain-visualization',
    'empathy-analytics',
    'intelligent-triggers',
    'comparison',
    'weather-correlation',
    'predictive-insights',
  ],
  reports: ['wcb-report', 'clinical-export', 'data-export'],
};

export interface DashboardSectionDefinition {
  id: DashboardSection;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const DASHBOARD_SECTIONS: DashboardSectionDefinition[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Daily essentials and quick capture',
    icon: Sun,
  },
  {
    id: 'insights',
    label: 'Insights',
    description: 'Visual trends and smart guidance',
    icon: LineChart,
  },
  {
    id: 'reports',
    label: 'Reports & Admin',
    description: 'Exports and claim-ready documents',
    icon: ClipboardList,
  },
];

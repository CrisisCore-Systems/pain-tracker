import React from 'react';
import { Grid3X3, Plus, Settings, Target } from 'lucide-react';

export type WidgetType =
  | 'dashboard-overview'
  | 'pain-entry'
  | 'pain-visualization'
  | 'recent-history'
  | 'empathy-analytics'
  | 'wcb-report'
  | 'current-stats'
  | 'quick-actions'
  | 'intelligent-triggers'
  | 'goal-tracking';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultSize: 'small' | 'medium' | 'large' | 'full';
  category: 'core' | 'analytics' | 'reports' | 'utilities';
  canRemove: boolean;
  canResize: boolean;
  traumaInformed: boolean;
}

export interface DashboardLayout {
  widgets: {
    id: string;
    type: WidgetType;
    size: 'small' | 'medium' | 'large' | 'full';
    position: number;
    visible: boolean;
  }[];
  layout: 'grid' | 'masonry' | 'list';
  columns: 1 | 2 | 3 | 4;
}

export const AVAILABLE_WIDGETS: Record<WidgetType, WidgetConfig> = {
  'dashboard-overview': {
    id: 'dashboard-overview',
    type: 'dashboard-overview',
    title: 'Dashboard Overview',
    description: 'Key metrics, charts, and recent activity',
    icon: <Grid3X3 className="h-4 w-4" />,
    defaultSize: 'large',
    category: 'core',
    canRemove: false,
    canResize: true,
    traumaInformed: true
  },
  'pain-entry': {
    id: 'pain-entry',
    type: 'pain-entry',
    title: 'Record Pain',
    description: 'Track your current pain level and symptoms',
    icon: <Plus className="h-4 w-4" />,
    defaultSize: 'large',
    category: 'core',
    canRemove: false,
    canResize: false,
    traumaInformed: true
  },
  'pain-visualization': {
    id: 'pain-visualization',
    type: 'pain-visualization',
    title: 'Pain Visualization',
    description: 'Charts and graphs of your pain patterns',
    icon: <Grid3X3 className="h-4 w-4" />,
    defaultSize: 'large',
    category: 'analytics',
    canRemove: true,
    canResize: true,
    traumaInformed: true
  },
  'recent-history': {
    id: 'recent-history',
    type: 'recent-history',
    title: 'Recent History',
    description: 'Your latest pain entries',
    icon: <Grid3X3 className="h-4 w-4" />,
    defaultSize: 'medium',
    category: 'core',
    canRemove: true,
    canResize: true,
    traumaInformed: true
  },
  'empathy-analytics': {
    id: 'empathy-analytics',
    type: 'empathy-analytics',
    title: 'Empathy Analytics',
    description: 'Quantified empathy metrics and insights',
    icon: <Grid3X3 className="h-4 w-4" />,
    defaultSize: 'large',
    category: 'analytics',
    canRemove: true,
    canResize: true,
    traumaInformed: true
  },
  'wcb-report': {
    id: 'wcb-report',
    type: 'wcb-report',
    title: 'WCB Report',
    description: "Workers' compensation report generator",
    icon: <Grid3X3 className="h-4 w-4" />,
    defaultSize: 'medium',
    category: 'reports',
    canRemove: true,
    canResize: true,
    traumaInformed: true
  },
  'current-stats': {
    id: 'current-stats',
    type: 'current-stats',
    title: 'Current Stats',
    description: 'Quick overview of your current metrics',
    icon: <Grid3X3 className="h-4 w-4" />,
    defaultSize: 'small',
    category: 'utilities',
    canRemove: true,
    canResize: false,
    traumaInformed: true
  },
  'quick-actions': {
    id: 'quick-actions',
    type: 'quick-actions',
    title: 'Quick Actions',
    description: 'Common actions and shortcuts',
    icon: <Grid3X3 className="h-4 w-4" />,
    defaultSize: 'small',
    category: 'utilities',
    canRemove: true,
    canResize: false,
    traumaInformed: true
  },
  'intelligent-triggers': {
    id: 'intelligent-triggers',
    type: 'intelligent-triggers',
    title: 'Intelligent Triggers',
    description: 'Smart notifications based on your pain patterns',
    icon: <Settings className="h-4 w-4" />,
    defaultSize: 'large',
    category: 'utilities',
    canRemove: true,
    canResize: true,
    traumaInformed: true
  },
  'goal-tracking': {
    id: 'goal-tracking',
    type: 'goal-tracking',
    title: 'Goal Tracking',
    description: 'Set and track your health and wellness goals',
    icon: <Target className="h-4 w-4" />,
    defaultSize: 'large',
    category: 'core',
    canRemove: true,
    canResize: true,
    traumaInformed: true
  }
};

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  widgets: [
    { id: 'dashboard-overview', type: 'dashboard-overview', size: 'large', position: 0, visible: true },
    { id: 'pain-entry', type: 'pain-entry', size: 'large', position: 1, visible: true },
    { id: 'goal-tracking', type: 'goal-tracking', size: 'large', position: 2, visible: true },
    { id: 'pain-visualization', type: 'pain-visualization', size: 'large', position: 3, visible: true },
    { id: 'recent-history', type: 'recent-history', size: 'medium', position: 4, visible: true },
    { id: 'current-stats', type: 'current-stats', size: 'small', position: 5, visible: true },
    { id: 'quick-actions', type: 'quick-actions', size: 'small', position: 6, visible: true },
    { id: 'intelligent-triggers', type: 'intelligent-triggers', size: 'large', position: 7, visible: false },
    { id: 'empathy-analytics', type: 'empathy-analytics', size: 'large', position: 8, visible: false },
    { id: 'wcb-report', type: 'wcb-report', size: 'medium', position: 9, visible: false }
  ],
  layout: 'grid',
  columns: 3
};

export default {};

/**
 * Customizable Dashboard Widgets System
 * Allows users to add, remove, and rearrange dashboard widgets with persistent preferences
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Plus,
  X,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Grid3X3,
  Layout,
  HelpCircle,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Modal, Badge } from '../../design-system';
import { DashboardOverview } from '../widgets/DashboardOverview';
import { PainEntryWidget } from '../widgets/PainEntryWidget';
import { EnhancedPainVisualizationPanel } from '../widgets/EnhancedPainVisualizationPanel';
import { PainHistoryPanel } from '../widgets/PainHistoryPanel';
import { QuantifiedEmpathyDashboard } from '../analytics/QuantifiedEmpathyDashboard';
import { WCBReportPanel } from '../widgets/WCBReportPanel';
import { TraumaInformedSection } from '../accessibility';
import { IntelligentTriggersManager } from '../notifications/IntelligentTriggersManager';
import { GoalDashboardWidget } from '../goals/GoalDashboardWidget';
import { cn } from '../../design-system/utils';
import { formatNumber } from '../../utils/formatting';
import { AdvancedFilters, type FilterCriteria, type SavedFilter } from './AdvancedFilters';
import { useSavedFilters } from '../../hooks/useSavedFilters';
import type { PainEntry } from '../../types';

// Widget types available in the system
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

// Available widgets registry
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
    description: 'Workers\' compensation report generator',
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

// Default dashboard layout
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

// Local storage key for dashboard preferences
const DASHBOARD_LAYOUT_KEY = 'pain-tracker-dashboard-layout';

// Hook for managing dashboard layout
function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_DASHBOARD_LAYOUT);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load layout from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DASHBOARD_LAYOUT_KEY);
      if (saved) {
        const parsedLayout = JSON.parse(saved);
        setLayout(parsedLayout);
      }
    } catch (error) {
      console.warn('Failed to load dashboard layout from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save layout to localStorage
  const saveLayout = useCallback((newLayout: DashboardLayout) => {
    try {
      localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(newLayout));
      setLayout(newLayout);
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  }, []);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    saveLayout(DEFAULT_DASHBOARD_LAYOUT);
  }, [saveLayout]);

  // Toggle widget visibility
  const toggleWidget = useCallback((widgetId: string) => {
    const newLayout = {
      ...layout,
      widgets: layout.widgets.map(widget =>
        widget.id === widgetId
          ? { ...widget, visible: !widget.visible }
          : widget
      )
    };
    saveLayout(newLayout);
  }, [layout, saveLayout]);

  // Update widget size
  const updateWidgetSize = useCallback((widgetId: string, size: 'small' | 'medium' | 'large' | 'full') => {
    const newLayout = {
      ...layout,
      widgets: layout.widgets.map(widget =>
        widget.id === widgetId
          ? { ...widget, size }
          : widget
      )
    };
    saveLayout(newLayout);
  }, [layout, saveLayout]);

  // Reorder widgets
  const reorderWidgets = useCallback((startIndex: number, endIndex: number) => {
    const newWidgets = Array.from(layout.widgets);
    const [removed] = newWidgets.splice(startIndex, 1);
    newWidgets.splice(endIndex, 0, removed);

    // Update positions
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      position: index
    }));

    const newLayout = {
      ...layout,
      widgets: updatedWidgets
    };
    saveLayout(newLayout);
  }, [layout, saveLayout]);

  // Update layout settings
  const updateLayoutSettings = useCallback((settings: Partial<DashboardLayout>) => {
    const newLayout = {
      ...layout,
      ...settings
    };
    saveLayout(newLayout);
  }, [layout, saveLayout]);

  return {
    layout,
    isLoaded,
    saveLayout,
    resetLayout,
    toggleWidget,
    updateWidgetSize,
    reorderWidgets,
    updateLayoutSettings
  };
}

// Widget Management Modal
interface WidgetManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: DashboardLayout;
  onToggleWidget: (widgetId: string) => void;
  onResetLayout: () => void;
  onUpdateLayoutSettings: (settings: Partial<Pick<DashboardLayout, 'layout' | 'columns'>>) => void;
}

function WidgetManagementModal({
  isOpen,
  onClose,
  layout,
  onToggleWidget,
  onResetLayout,
  onUpdateLayoutSettings
}: WidgetManagementModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'analytics' | 'reports' | 'utilities'>('all');

  const categories = [
    { id: 'all' as const, label: 'All Widgets', count: layout.widgets.length },
    { id: 'core' as const, label: 'Core', count: layout.widgets.filter(w => AVAILABLE_WIDGETS[w.type].category === 'core').length },
    { id: 'analytics' as const, label: 'Analytics', count: layout.widgets.filter(w => AVAILABLE_WIDGETS[w.type].category === 'analytics').length },
    { id: 'reports' as const, label: 'Reports', count: layout.widgets.filter(w => AVAILABLE_WIDGETS[w.type].category === 'reports').length },
    { id: 'utilities' as const, label: 'Utilities', count: layout.widgets.filter(w => AVAILABLE_WIDGETS[w.type].category === 'utilities').length }
  ];

  const filteredWidgets = selectedCategory === 'all'
    ? layout.widgets
    : layout.widgets.filter(w => AVAILABLE_WIDGETS[w.type].category === selectedCategory);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Customize Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Add, remove, and rearrange your dashboard widgets
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layout className="h-5 w-5" />
              <span>Layout Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Layout Style</label>
                <select
                  value={layout.layout}
                  onChange={(e) => onUpdateLayoutSettings({ layout: e.target.value as 'grid' | 'masonry' | 'list' })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="grid">Grid</option>
                  <option value="masonry">Masonry</option>
                  <option value="list">List</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Columns</label>
                <select
                  value={layout.columns}
                  onChange={(e) => onUpdateLayoutSettings({ columns: parseInt(e.target.value) as 1 | 2 | 3 | 4 })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={1}>1 Column</option>
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-3 py-2 text-sm rounded-full border transition-colors',
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary/50'
              )}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Widget List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWidgets.map((widget) => {
            const config = AVAILABLE_WIDGETS[widget.type];
            return (
              <Card key={widget.id} className={cn(
                'transition-all',
                widget.visible ? 'border-primary/20 bg-primary/5' : 'opacity-60'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-primary mt-1">
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{config.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {config.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {config.category}
                          </Badge>
                          {config.canRemove && (
                            <Badge variant="secondary" className="text-xs">
                              Removable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleWidget(widget.id)}
                        className="p-2"
                      >
                        {widget.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onResetLayout}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Dashboard Widget Component
interface DashboardWidgetProps {
  widget: {
    id: string;
    type: WidgetType;
    size: 'small' | 'medium' | 'large' | 'full';
    position: number;
    visible: boolean;
  };
  entries: PainEntry[];
  allEntries: PainEntry[];
  onAddEntry: (entry: Omit<PainEntry, "id" | "timestamp">) => void;
  onStartWalkthrough: () => void;
  onOpenGoalManager?: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  isDragging: boolean;
  layout: 'grid' | 'masonry' | 'list';
}

function DashboardWidget({
  widget,
  entries,
  allEntries,
  onAddEntry,
  onStartWalkthrough,
  onOpenGoalManager,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
  layout
}: DashboardWidgetProps) {
  // const config = AVAILABLE_WIDGETS[widget.type]; // Not needed for rendering

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'dashboard-overview':
    return <DashboardOverview entries={entries} allEntries={allEntries} />;
      case 'pain-entry':
        return (
          <TraumaInformedSection
            title="Record Your Pain"
            description="Track your current pain level and symptoms"
            importance="high"
            canCollapse={false}
          >
            <PainEntryWidget onSubmit={onAddEntry} />
          </TraumaInformedSection>
        );
      case 'pain-visualization':
        return (
          <TraumaInformedSection
            title="Pain Visualization"
            description="Charts and graphs of your pain patterns"
            importance="normal"
            canCollapse={true}
          >
            <EnhancedPainVisualizationPanel entries={entries} />
          </TraumaInformedSection>
        );
      case 'recent-history':
        return (
          <TraumaInformedSection
            title="Recent History"
            description={`Your ${entries.length} recorded pain ${entries.length === 1 ? 'entry' : 'entries'}`}
            importance="normal"
            canCollapse={true}
          >
            <PainHistoryPanel entries={entries.slice(-5)} />
          </TraumaInformedSection>
        );
      case 'empathy-analytics':
        return (
          <TraumaInformedSection
            title="Empathy Analytics"
            description="Quantified empathy metrics and insights for your healing journey"
            importance="normal"
            canCollapse={true}
          >
            <QuantifiedEmpathyDashboard
              userId="current-user"
              painEntries={entries}
              onInsightSelect={(insight) => {
                console.log('Insight selected:', insight);
              }}
              onRecommendationAccept={(recommendation) => {
                console.log('Recommendation accepted:', recommendation);
              }}
              onShareMetrics={(metrics) => {
                console.log('Share metrics:', metrics);
              }}
              showAdvancedMetrics={true}
            />
          </TraumaInformedSection>
        );
      case 'wcb-report':
        return (
          <TraumaInformedSection
            title="Workers' Compensation Report"
            description="Generate reports for your workers' compensation claim"
            importance="normal"
            canCollapse={true}
          >
            <WCBReportPanel entries={entries} />
          </TraumaInformedSection>
        );
      case 'current-stats':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Entries</span>
                <Badge variant="secondary">{entries.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Pain Level</span>
                <Badge variant="outline">
                  {entries.length > 0
                    ? formatNumber(entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / entries.length, 1)
                    : '0'
                  }
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Entry</span>
                <span className="text-sm">
                  {new Date(entries[entries.length - 1]?.timestamp || '').toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      case 'quick-actions':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onStartWalkthrough}
                leftIcon={<HelpCircle className="h-4 w-4" />}
              >
                Help & Tutorial
              </Button>
            </CardContent>
          </Card>
        );
      case 'intelligent-triggers':
        return (
          <TraumaInformedSection
            title="Intelligent Triggers"
            description="Smart notifications based on your pain patterns and goals"
            importance="normal"
            canCollapse={true}
          >
            <IntelligentTriggersManager />
          </TraumaInformedSection>
        );
      case 'goal-tracking':
        return (
          <TraumaInformedSection
            title="Goal Tracking"
            description="Set and track your health and wellness goals"
            importance="normal"
            canCollapse={true}
          >
            <GoalDashboardWidget
              onOpenManager={onOpenGoalManager || (() => {
                // TODO: Implement goal manager opening logic
                console.log('Open goal manager');
              })}
            />
          </TraumaInformedSection>
        );
      default:
        return (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>Widget type "{widget.type}" not implemented</p>
            </CardContent>
          </Card>
        );
    }
  };

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3',
    full: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4'
  };

  return (
    <div
      className={cn(
        'transition-all duration-200',
        layout === 'grid' && sizeClasses[widget.size],
        isDragging && 'opacity-50 scale-95',
        'cursor-move'
      )}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="relative">
        {/* Drag Handle */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-background/80 backdrop-blur-sm rounded p-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Widget Content */}
        <div className="group">
          {renderWidgetContent()}
        </div>
      </div>
    </div>
  );
}

// Main Customizable Dashboard Component
interface CustomizableDashboardProps {
  entries: PainEntry[];
  onAddEntry: (entry: Omit<PainEntry, "id" | "timestamp">) => void;
  onStartWalkthrough: () => void;
  onOpenGoalManager?: () => void;
  className?: string;
}

export function CustomizableDashboard({
  entries,
  onAddEntry,
  onStartWalkthrough,
  onOpenGoalManager,
  className
}: CustomizableDashboardProps) {
  const {
    layout,
    isLoaded,
    toggleWidget,
    resetLayout,
    updateLayoutSettings
  } = useDashboardLayout();

  const [showWidgetManager, setShowWidgetManager] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [filteredEntries, setFilteredEntries] = useState<PainEntry[]>(entries);
  const { savedFilters, saveFilter, deleteFilter } = useSavedFilters();

  // Update filtered entries when entries change
  useEffect(() => {
    setFilteredEntries(entries);
  }, [entries]);

  // Get visible widgets sorted by position
  const visibleWidgets = layout.widgets
    .filter(widget => widget.visible)
    .sort((a, b) => a.position - b.position);

  // Handle drag start
  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  // Handle drop
  const handleDrop = (targetWidgetId: string) => {
    if (!draggedWidget || draggedWidget === targetWidgetId) return;

    const draggedIndex = layout.widgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = layout.widgets.findIndex(w => w.id === targetWidgetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Reorder widgets
      const newWidgets = Array.from(layout.widgets);
      const [removed] = newWidgets.splice(draggedIndex, 1);
      newWidgets.splice(targetIndex, 0, removed);

      // Update positions
      const updatedWidgets = newWidgets.map((widget, index) => ({
        ...widget,
        position: index
      }));

      updateLayoutSettings({ widgets: updatedWidgets });
    }
  };

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilteredEntries: PainEntry[]) => {
    setFilteredEntries(newFilteredEntries);
  }, []);

  // Handle saving a filter
  const handleSaveFilter = useCallback((name: string, criteria: FilterCriteria) => {
    saveFilter(name, criteria);
  }, [saveFilter]);

  // Handle loading a filter
  const handleLoadFilter = useCallback((filter: SavedFilter) => {
    // The filter criteria will be applied through the AdvancedFilters component
    console.log('Loading filter:', filter.name);
  }, []);

  // Handle deleting a filter
  const handleDeleteFilter = useCallback((filterId: string) => {
    deleteFilter(filterId);
  }, [deleteFilter]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Advanced Filters */}
      <AdvancedFilters
        entries={entries}
        onFiltersChange={handleFiltersChange}
        savedFilters={savedFilters}
        onSaveFilter={handleSaveFilter}
        onLoadFilter={handleLoadFilter}
        onDeleteFilter={handleDeleteFilter}
      />

      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Custom Dashboard</h2>
          <p className="text-muted-foreground">
            Your personalized pain tracking dashboard
            {filteredEntries.length !== entries.length && (
              <span className="ml-2 text-sm">
                (showing {filteredEntries.length} of {entries.length} entries)
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowWidgetManager(true)}
          leftIcon={<Settings className="h-4 w-4" />}
        >
          Customize
        </Button>
      </div>

      {/* Dashboard Grid */}
      <div className={cn(
        'grid gap-6',
        layout.layout === 'grid' && (
          layout.columns === 1 ? 'grid-cols-1' :
          layout.columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
          layout.columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
          layout.columns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        ),
        layout.layout === 'masonry' && 'columns-1 md:columns-2 lg:columns-3',
        layout.layout === 'list' && 'grid-cols-1'
      )}>
        {visibleWidgets.map((widget) => (
          <DashboardWidget
            key={widget.id}
            widget={widget}
            entries={filteredEntries}
            allEntries={entries}
            onAddEntry={onAddEntry}
            onStartWalkthrough={onStartWalkthrough}
            onOpenGoalManager={onOpenGoalManager}
            onDragStart={() => handleDragStart(widget.id)}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(widget.id)}
            isDragging={draggedWidget === widget.id}
            layout={layout.layout}
          />
        ))}
      </div>

      {/* Widget Management Modal */}
      <WidgetManagementModal
        isOpen={showWidgetManager}
        onClose={() => setShowWidgetManager(false)}
        layout={layout}
        onToggleWidget={toggleWidget}
        onResetLayout={resetLayout}
        onUpdateLayoutSettings={updateLayoutSettings}
      />
    </div>
  );
}

import React, { lazy, Suspense, useState } from 'react';
import { GripVertical, HelpCircle, FileDown, Download, Settings, Plus, Calendar } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../../design-system';
import { cn } from '../../design-system/utils';
import { TraumaInformedSection } from '../accessibility';
import { ModernDashboard } from '../widgets/ModernDashboard';
import { PainEntryWidget } from '../widgets/PainEntryWidget';
import { EnhancedPainVisualizationPanel } from '../widgets/EnhancedPainVisualizationPanel';
import { PainHistoryPanel } from '../widgets/PainHistoryPanel';
import { QuantifiedEmpathyDashboard } from '../analytics/QuantifiedEmpathyDashboard';
import { IntelligentTriggersManager } from '../notifications/IntelligentTriggersManager';
import { GoalDashboardWidget } from '../goals/GoalDashboardWidget';
import { ComparisonDashboardWidget } from '../widgets/ComparisonDashboardWidget';
import { WeatherCorrelationPanel } from '../analytics/WeatherCorrelationPanel';
import PredictivePanel from '../PredictivePanel';
import { formatNumber } from '../../utils/formatting';
import { isSameLocalDay, localDayStart } from '../../utils/dates';
import type { WidgetType } from './constants';
import type { PainEntry } from '../../types';

// Lazy load heavy panels to defer library loading
const WCBReportPanel = lazy(() =>
  import('../widgets/WCBReportPanel').then(m => ({ default: m.WCBReportPanel }))
);
const ClinicalPDFExportButton = lazy(() =>
  import('../export/ClinicalPDFExportButton').then(m => ({ default: m.ClinicalPDFExportButton }))
);
const DataExportModal = lazy(() =>
  import('../export/DataExportModal').then(m => ({ default: m.DataExportModal }))
);

type LayoutStyle = 'grid' | 'masonry' | 'list';

type WidgetRendererContext = {
  entries: PainEntry[];
  allEntries: PainEntry[];
  onAddEntry: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => void;
  onStartWalkthrough: () => void;
  onOpenGoalManager?: () => void;
  onNavigate?: (view: string) => void;
};

type WidgetRenderer = (context: WidgetRendererContext) => React.ReactNode;

const renderDashboardOverview: WidgetRenderer = ({ entries, allEntries }) => (
  <ModernDashboard entries={entries} allEntries={allEntries} />
);

const renderPainEntry: WidgetRenderer = ({ onAddEntry }) => (
  <TraumaInformedSection
    title="Record Your Pain"
    description="Track your current pain level and symptoms"
    importance="high"
    canCollapse={false}
  >
    <PainEntryWidget onSubmit={onAddEntry} />
  </TraumaInformedSection>
);

const renderPainVisualization: WidgetRenderer = ({ entries }) => (
  <TraumaInformedSection
    title="Pain Visualization"
    description="Charts and graphs of your pain patterns"
    importance="normal"
    canCollapse={true}
  >
    <EnhancedPainVisualizationPanel entries={entries} />
  </TraumaInformedSection>
);

const renderRecentHistory: WidgetRenderer = ({ entries }) => (
  <TraumaInformedSection
    title="Recent History"
    description={`Your ${entries.length} recorded pain ${entries.length === 1 ? 'entry' : 'entries'}`}
    importance="normal"
    canCollapse={true}
  >
    <PainHistoryPanel entries={entries.slice(-5)} />
  </TraumaInformedSection>
);

const renderEmpathyAnalytics: WidgetRenderer = ({ entries }) => (
  <TraumaInformedSection
    title="Empathy Analytics"
    description="Quantified empathy metrics and insights for your healing journey"
    importance="normal"
    canCollapse={true}
  >
    <QuantifiedEmpathyDashboard
      userId="current-user"
      painEntries={entries}
      onInsightSelect={insight => {
        if (import.meta.env.DEV) {
          console.log('Insight selected:', insight);
        }
      }}
      onRecommendationAccept={recommendation => {
        if (import.meta.env.DEV) {
          console.log('Recommendation accepted:', recommendation);
        }
      }}
      onShareMetrics={metrics => {
        if (import.meta.env.DEV) {
          console.log('Share metrics:', metrics);
        }
      }}
      showAdvancedMetrics={true}
    />
  </TraumaInformedSection>
);

const renderWcbReport: WidgetRenderer = ({ entries }) => (
  <TraumaInformedSection
    title="Workers' Compensation Report"
    description="Generate reports for your workers' compensation claim"
    importance="normal"
    canCollapse={true}
  >
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
          <div className="animate-pulse">Loading WCB Report...</div>
        </div>
      }
    >
      <WCBReportPanel entries={entries} />
    </Suspense>
  </TraumaInformedSection>
);

const renderCurrentStats: WidgetRenderer = ({ entries, allEntries }) => {
  const totalEntries = entries.length;
  const averagePain =
    totalEntries > 0
      ? formatNumber(
          entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / totalEntries,
          1
        )
      : '0';
  const lastEntryDate =
    totalEntries > 0
      ? new Date(entries[entries.length - 1]?.timestamp || '').toLocaleDateString()
      : '—';

  // Compute 7-day vs prior 7-day trend
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const thisWeek = allEntries.filter(e => new Date(e.timestamp) >= weekAgo);
  const lastWeek = allEntries.filter(
    e => new Date(e.timestamp) >= twoWeeksAgo && new Date(e.timestamp) < weekAgo
  );

  const thisWeekAvg =
    thisWeek.length > 0
      ? thisWeek.reduce((s, e) => s + e.baselineData.pain, 0) / thisWeek.length
      : null;
  const lastWeekAvg =
    lastWeek.length > 0
      ? lastWeek.reduce((s, e) => s + e.baselineData.pain, 0) / lastWeek.length
      : null;

  const trendDelta =
    thisWeekAvg !== null && lastWeekAvg !== null
      ? Number((thisWeekAvg - lastWeekAvg).toFixed(1))
      : null;

  const todayEntries = allEntries.filter(e => isSameLocalDay(new Date(e.timestamp), now)).length;

  // Simple 7-day sparkline
  const sparkline: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayEntries = allEntries.filter(e => isSameLocalDay(new Date(e.timestamp), day));
    const avg =
      dayEntries.length > 0
        ? dayEntries.reduce((s, e) => s + e.baselineData.pain, 0) / dayEntries.length
        : 0;
    sparkline.push(avg);
  }
  const sparkMax = Math.max(...sparkline, 1);

  return (
    <div className="flex h-full flex-col gap-5 rounded-2xl bg-background/70 p-6 text-sm shadow-inner shadow-black/5">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
        <span>Current overview</span>
        <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">
          Live
        </Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Entries recorded</p>
          <p className="text-2xl font-semibold text-foreground">{totalEntries}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Average pain</p>
          <p className="text-2xl font-semibold text-foreground">{averagePain}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="text-2xl font-semibold text-foreground">{todayEntries}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Last entry</p>
          <p className="text-base font-medium text-foreground/80">{lastEntryDate}</p>
        </div>
      </div>
      {/* Weekly trend */}
      {trendDelta !== null && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Week-over-week:</span>
          <span
            className={cn(
              'font-medium',
              trendDelta < 0
                ? 'text-green-600 dark:text-green-400'
                : trendDelta > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-muted-foreground'
            )}
          >
            {trendDelta > 0 ? '+' : ''}
            {trendDelta} avg pain
          </span>
        </div>
      )}
      {/* Sparkline */}
      {sparkline.some(v => v > 0) && (
        <div className="flex items-end gap-1 h-8">
          {sparkline.map((val, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-primary/30"
              style={{ height: `${Math.max((val / sparkMax) * 100, 4)}%` }}
              title={`Day ${i + 1}: ${val.toFixed(1)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const renderQuickActions: WidgetRenderer = ({ onStartWalkthrough }) => (
  <div className="flex flex-col gap-3 rounded-2xl bg-background/70 p-6 shadow-inner shadow-black/5">
    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
      Quick actions
    </div>
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant="outline"
        className="justify-start"
        onClick={onStartWalkthrough}
        leftIcon={<HelpCircle className="h-4 w-4" />}
      >
        Help & Tutorial
      </Button>
    </div>
  </div>
);

const renderIntelligentTriggers: WidgetRenderer = () => (
  <TraumaInformedSection
    title="Intelligent Triggers"
    description="Smart notifications based on your pain patterns and goals"
    importance="normal"
    canCollapse={true}
  >
    <IntelligentTriggersManager />
  </TraumaInformedSection>
);

const renderGoalTracking: WidgetRenderer = ({ onOpenGoalManager }) => (
  <TraumaInformedSection
    title="Goal Tracking"
    description="Set and track your health and wellness goals"
    importance="normal"
    canCollapse={true}
  >
    <GoalDashboardWidget onOpenManager={onOpenGoalManager ?? (() => {})} />
  </TraumaInformedSection>
);

const renderComparison: WidgetRenderer = ({ entries }) => (
  <TraumaInformedSection
    title="Period Comparison"
    description="Compare pain trends across different time periods"
    importance="normal"
    canCollapse={true}
  >
    <ComparisonDashboardWidget entries={entries} />
  </TraumaInformedSection>
);

const renderWeatherCorrelation: WidgetRenderer = ({ entries }) => (
  <TraumaInformedSection
    title="Weather & Pain"
    description="How weather conditions may relate to your pain levels"
    importance="normal"
    canCollapse={true}
  >
    <WeatherCorrelationPanel entries={entries} />
  </TraumaInformedSection>
);

const renderPredictiveInsights: WidgetRenderer = ({ entries }) => (
  <TraumaInformedSection
    title="Predictive Insights"
    description="Flare-up risk assessment based on recent patterns"
    importance="normal"
    canCollapse={true}
  >
    <PredictivePanel entries={entries} />
  </TraumaInformedSection>
);

const renderClinicalExport: WidgetRenderer = ({ entries }) => (
  <TraumaInformedSection
    title="Clinical PDF Export"
    description="Generate clinical-grade PDF reports for healthcare providers"
    importance="normal"
    canCollapse={true}
  >
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
          <div className="animate-pulse">Loading Clinical Export...</div>
        </div>
      }
    >
      <ClinicalPDFExportButton entries={entries} />
    </Suspense>
  </TraumaInformedSection>
);

function DataExportWidget({ entries }: { entries: PainEntry[] }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="flex flex-col gap-3 p-2">
        <p className="text-sm text-muted-foreground">
          Export {entries.length} entries in CSV, JSON, or PDF format. Your data never leaves your
          device.
        </p>
        <Button
          variant="outline"
          onClick={() => setShowModal(true)}
          leftIcon={<Download className="h-4 w-4" />}
        >
          Export Data
        </Button>
      </div>
      <Suspense fallback={null}>
        {showModal && <DataExportModal isOpen={showModal} entries={entries} onClose={() => setShowModal(false)} />}
      </Suspense>
    </>
  );
}

const renderDataExport: WidgetRenderer = ({ entries }) => (
  <TraumaInformedSection
    title="Data Export"
    description="Export your data in multiple formats"
    importance="normal"
    canCollapse={true}
  >
    <DataExportWidget entries={entries} />
  </TraumaInformedSection>
);

const WIDGET_RENDERERS: Record<WidgetType, WidgetRenderer> = {
  'dashboard-overview': renderDashboardOverview,
  'pain-entry': renderPainEntry,
  'pain-visualization': renderPainVisualization,
  'recent-history': renderRecentHistory,
  'empathy-analytics': renderEmpathyAnalytics,
  'wcb-report': renderWcbReport,
  'current-stats': renderCurrentStats,
  'quick-actions': renderQuickActions,
  'intelligent-triggers': renderIntelligentTriggers,
  'goal-tracking': renderGoalTracking,
  comparison: renderComparison,
  'weather-correlation': renderWeatherCorrelation,
  'predictive-insights': renderPredictiveInsights,
  'clinical-export': renderClinicalExport,
  'data-export': renderDataExport,
};

const sizeClasses = {
  small: 'col-span-1',
  medium: 'col-span-1 md:col-span-1',
  large: 'col-span-1 md:col-span-2',
  full: 'col-span-1 md:col-span-2',
} as const;

export interface DashboardWidgetProps {
  widget: {
    id: string;
    type: WidgetType;
    size: 'small' | 'medium' | 'large' | 'full';
    position: number;
    visible: boolean;
  };
  entries: PainEntry[];
  allEntries: PainEntry[];
  onAddEntry: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => void;
  onStartWalkthrough: () => void;
  onOpenGoalManager?: () => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, widgetId: string) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>, targetWidgetId: string) => void;
  isDragging: boolean;
  layout: LayoutStyle;
}

export function DashboardWidget({
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
  layout,
}: DashboardWidgetProps) {
  const renderer = WIDGET_RENDERERS[widget.type];

  const content = renderer ? (
    renderer({ entries, allEntries, onAddEntry, onStartWalkthrough, onOpenGoalManager })
  ) : (
    <Card>
      <CardContent className="p-6 text-center text-muted-foreground">
        <h3 className="text-lg font-medium mb-2">Unknown widget</h3>
        <p className="mb-3">
          This widget type <span className="font-mono">{widget.type}</span> is not available in your
          current build.
        </p>
        <p className="text-sm mb-4">See the feature matrix for planned widgets and timelines.</p>
        <div className="flex items-center justify-center space-x-3">
          <a href="/docs/FEATURE_MATRIX.md" className="text-sm text-primary hover:underline">
            View feature matrix
          </a>
          <a
            href={`mailto:hello@crisiscore.systems?subject=Feature%20request%3A%20${encodeURIComponent(widget.type)}`}
            className="text-sm inline-flex items-center px-3 py-1.5 border border-border rounded-md hover:bg-primary/5"
          >
            Request this feature
          </a>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div
      className={cn(
        'group/widget relative flex h-full min-w-0 cursor-move transition-transform duration-200',
        layout === 'grid' && sizeClasses[widget.size],
        layout === 'masonry' && 'break-inside-avoid',
        isDragging && 'opacity-60 blur-[1px]'
      )}
      draggable
      onDragStart={event => onDragStart(event, widget.id)}
      onDragEnd={event => onDragEnd(event)}
      onDragOver={event => event.preventDefault()}
      onDrop={event => onDrop(event, widget.id)}
    >
      <div
        className={cn(
          'relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card/95 to-card shadow-sm shadow-primary/5 ring-1 ring-border/30',
          'transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/15 focus-within:-translate-y-0.5 focus-within:shadow-lg focus-within:shadow-primary/20',
          '[@media(prefers-reduced-motion:reduce)]:transform-none [@media(prefers-reduced-motion:reduce)]:transition-none',
          '[&_section.trauma-informed-section]:mb-0',
          '[&_section.trauma-informed-section]:px-6',
          '[&_section.trauma-informed-section]:py-6',
          '[&_section.trauma-informed-section>div]:mb-4',
          '[&_section.trauma-informed-section>div>h2]:text-lg',
          '[&_section.trauma-informed-section>div>p]:text-sm',
          '[&_section.trauma-informed-section>div>p]:text-muted-foreground'
        )}
      >
        <div className="absolute right-4 top-4 z-10 hidden rounded-full border border-border/60 bg-background/80 p-1 text-muted-foreground shadow-sm transition-opacity duration-200 group-hover/widget:flex">
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </div>

        <div className="flex h-full flex-col">{content}</div>
      </div>
    </div>
  );
}

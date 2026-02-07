import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileJson,
  FileType,
  Calendar,
  Clock,
  Shield,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../design-system';
import { cn } from '../../design-system/utils';
import type { PainEntry } from '../../types';
import { exportToCSV, exportToJSON, exportToPDF, downloadData } from '../../utils/pain-tracker/export';
import { downloadWorkSafeBCPDF } from '../../utils/pain-tracker/wcb-export';
import { useToast } from '../feedback';

interface ReportsPageProps {
  entries: PainEntry[];
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  format: string;
  color: string;
  action: () => void;
}

interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}

export function ReportsPage({ entries }: ReportsPageProps) {
  const toast = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('7d');
  const [showExportPreview, setShowExportPreview] = useState(false);

  // Filter entries based on date range
  const filteredEntries = useMemo(() => {
    if (dateRange === 'all') return entries;
    
    const now = new Date();
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const cutoff = new Date(now.getTime() - daysMap[dateRange] * 24 * 60 * 60 * 1000);
    
    return entries.filter(entry => new Date(entry.timestamp) >= cutoff);
  }, [entries, dateRange]);

  const csvHeaderPreview = useMemo(() => {
    try {
      return exportToCSV([] as unknown as PainEntry[]).split('\n')[0] ?? '';
    } catch {
      return '';
    }
  }, []);

  const jsonPreview = useMemo(() => {
    try {
      const raw = exportToJSON([] as unknown as PainEntry[]);
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return '[]';
    }
  }, []);

  // Calculate quick stats
  const quickStats: QuickStat[] = useMemo(() => {
    if (filteredEntries.length === 0) {
      return [
        { label: 'Total Entries', value: 0, icon: FileText },
        { label: 'Avg Pain Level', value: '-', icon: TrendingUp },
        { label: 'Date Range', value: 'No data', icon: Calendar },
      ];
    }

    const avgPain = filteredEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / filteredEntries.length;
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const startDate = new Date(sortedEntries[0].timestamp).toLocaleDateString();
    const endDate = new Date(sortedEntries[sortedEntries.length - 1].timestamp).toLocaleDateString();

    return [
      { label: 'Total Entries', value: filteredEntries.length, icon: FileText },
      { label: 'Avg Pain Level', value: avgPain.toFixed(1), icon: TrendingUp },
      { label: 'Date Range', value: `${startDate} - ${endDate}`, icon: Calendar },
    ];
  }, [filteredEntries]);

  const handleExport = async (type: string, exportFn: () => string | Promise<string>, filename: string, mimeType: string) => {
    if (filteredEntries.length === 0) {
      toast.error('No Data', 'There are no entries to export for the selected date range.');
      return;
    }

    setIsExporting(type);
    try {
      // Small delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      const data = await exportFn();
      downloadData(data, filename, mimeType);
      toast.success('Export Complete', `Your ${type.toUpperCase()} report has been downloaded.`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export Failed', 'Unable to generate the report. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleWorkSafeBCExport = async () => {
    if (filteredEntries.length === 0) {
      toast.error('No Data', 'There are no entries to include in the report.');
      return;
    }

    setIsExporting('worksafe-bc');
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const sorted = [...filteredEntries].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      const startDate = new Date(sorted[0].timestamp);
      const endDate = new Date(sorted[sorted.length - 1].timestamp);

      await downloadWorkSafeBCPDF(filteredEntries, {
        startDate,
        endDate,
        includeDetailedEntries: true,
      });
      toast.success('Export Complete', 'Your WorkSafe BC report has been downloaded.');
    } catch (error) {
      console.error('WCB export error:', error);
      toast.error('Export Failed', 'Unable to generate the WorkSafe BC report. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const reportTypes: ReportType[] = [
    {
      id: 'csv',
      name: 'CSV Spreadsheet',
      description: 'Export your data as a CSV file for use in Excel, Google Sheets, or other spreadsheet applications.',
      icon: FileSpreadsheet,
      format: 'CSV',
      color: 'emerald',
      action: () => handleExport(
        'csv',
        () => exportToCSV(filteredEntries),
        `pain-tracker-export-${new Date().toISOString().split('T')[0]}.csv`,
        'text/csv'
      ),
    },
    {
      id: 'json',
      name: 'JSON Data',
      description: 'Export your complete data in JSON format, including all metadata and details.',
      icon: FileJson,
      format: 'JSON',
      color: 'amber',
      action: () => handleExport(
        'json',
        () => exportToJSON(filteredEntries),
        `pain-tracker-export-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      ),
    },
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Generate a formatted PDF report with summary statistics.',
      icon: FileType,
      format: 'PDF',
      color: 'rose',
      action: () => handleExport(
        'pdf',
        () => exportToPDF(filteredEntries),
        `pain-tracker-report-${new Date().toISOString().split('T')[0]}.pdf`,
        'application/pdf'
      ),
    },
  ];

  const specializedReports = [
    {
      id: 'worksafe-bc',
      name: 'WorkSafe BC Report',
      description: 'For WorkSafeBC claims in British Columbia (Canada). Includes a structured clinical summary and pain trends (not affiliated with WorkSafeBC).',
      icon: Shield,
      badge: 'WCB',
      available: true,
    },
    {
      id: 'insurance',
      name: 'Insurance Report',
      description: 'Create a comprehensive report for insurance claims with medical documentation support.',
      icon: FileText,
      badge: 'Coming soon',
      available: false,
    },
    {
      id: 'clinical',
      name: 'Clinical Summary',
      description: 'Generate a clinical summary for healthcare providers with a clear timeline and symptom overview.',
      icon: TrendingUp,
      badge: 'Coming soon',
      available: false,
    },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ] as const;

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="relative rounded-2xl border border-border/60 bg-gradient-to-b from-primary/[0.04] to-transparent p-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports & Export</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Export your pain tracking data or generate specialized reports
              </p>
            </div>
          </div>
        
          {/* Date Range Filter */}
          <div className="inline-flex items-center gap-1 rounded-xl bg-muted/50 p-1">
            {dateRangeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  dateRange === option.value
                    ? 'bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export Preview / What's Included */}
      <Card className="rounded-2xl border border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-base font-semibold tracking-tight">What exports include</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportPreview(v => !v)}
              aria-expanded={showExportPreview}
            >
              {showExportPreview ? 'Hide preview' : 'Show preview'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Exports are generated on your device. The preview below shows structure/field names only • it does not display your entries.
          </p>

          {showExportPreview && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-sky-200/70 dark:border-sky-800 bg-white/70 dark:bg-gray-900/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="font-medium text-sm">CSV Spreadsheet</div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Columns (header row)</div>
                <pre className="text-xs whitespace-pre-wrap break-words rounded-lg bg-gray-100/80 dark:bg-gray-800/50 p-3 border border-gray-200 dark:border-gray-700">
{csvHeaderPreview || '(preview unavailable)'}
                </pre>
              </div>

              <div className="rounded-xl border border-sky-200/70 dark:border-sky-800 bg-white/70 dark:bg-gray-900/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileJson className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <div className="font-medium text-sm">JSON Data</div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Top-level structure (empty export)
                </div>
                <pre className="text-xs whitespace-pre-wrap break-words rounded-lg bg-gray-100/80 dark:bg-gray-800/50 p-3 border border-gray-200 dark:border-gray-700">
{jsonPreview}
                </pre>
              </div>

              <div className="rounded-xl border border-sky-200/70 dark:border-sky-800 bg-white/70 dark:bg-gray-900/30 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileType className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <div className="font-medium text-sm">PDF Report</div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  A formatted summary (no preview shown here • PDFs include your selected date range and aggregate statistics).
                </div>
              </div>

              <div className="rounded-xl border border-sky-200/70 dark:border-sky-800 bg-white/70 dark:bg-gray-900/30 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                  <div className="font-medium text-sm">WorkSafeBC (WCB)</div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Built for WorkSafeBC documentation workflows (BC, Canada). Review the PDF before sharing.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => {
          const colors = ['blue', 'emerald', 'purple'] as const;
          const color = colors[index % colors.length];
          const colorMap = {
            blue: { border: 'border-l-blue-500', bg: 'bg-blue-500/10', ring: 'ring-blue-500/20', text: 'text-blue-500' },
            emerald: { border: 'border-l-emerald-500', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20', text: 'text-emerald-500' },
            purple: { border: 'border-l-purple-500', bg: 'bg-purple-500/10', ring: 'ring-purple-500/20', text: 'text-purple-500' },
          };
          const c = colorMap[color];
          return (
            <div key={index} className={cn('rounded-2xl border border-border/60 bg-card/50 p-4 border-l-4', c.border)}>
              <div className="flex items-center gap-3">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg ring-1', c.bg, c.ring)}>
                  <stat.icon className={cn('h-4 w-4', c.text)} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Data Warning */}
      {filteredEntries.length === 0 && (
        <div className="rounded-2xl border border-amber-300/60 dark:border-amber-700/40 bg-amber-50/50 dark:bg-amber-950/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">No Data Available</h3>
              <p className="text-sm text-muted-foreground mt-1">
                  {dateRange === 'all' 
                    ? "You haven't logged any pain entries yet. Start tracking to generate reports."
                    : `No entries found for the selected time period. Try selecting a different date range.`
                  }
                </p>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <Card className="rounded-2xl border border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Download className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-semibold tracking-tight">Quick Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTypes.map((report) => {
              const colorMap: Record<string, { bg: string; ring: string; text: string; hover: string }> = {
                emerald: { bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20', text: 'text-emerald-500', hover: 'hover:border-emerald-300 dark:hover:border-emerald-700' },
                amber: { bg: 'bg-amber-500/10', ring: 'ring-amber-500/20', text: 'text-amber-500', hover: 'hover:border-amber-300 dark:hover:border-amber-700' },
                rose: { bg: 'bg-rose-500/10', ring: 'ring-rose-500/20', text: 'text-rose-500', hover: 'hover:border-rose-300 dark:hover:border-rose-700' },
              };
              const c = colorMap[report.color] ?? colorMap.emerald;
              return (
                <button
                  key={report.id}
                  onClick={report.action}
                  disabled={isExporting !== null || filteredEntries.length === 0}
                  className={cn(
                    'relative p-5 rounded-2xl border border-border/60 bg-card/50 transition-all duration-200',
                    filteredEntries.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : cn('cursor-pointer hover:bg-muted/30 hover:shadow-sm', c.hover),
                    isExporting === report.id && 'ring-2 ring-primary/30 bg-primary/5'
                  )}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl ring-1', c.bg, c.ring)}>
                      {isExporting === report.id ? (
                        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <report.icon className={cn('h-5 w-5', c.text)} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{report.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs rounded-full">
                      {report.format}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Specialized Reports */}
      <Card className="rounded-2xl border border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-semibold tracking-tight">Specialized Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {specializedReports.map((report) => (
              <button
                key={report.id}
                onClick={() => {
                  if (filteredEntries.length === 0) {
                    toast.error('No Data', 'There are no entries to include in the report.');
                    return;
                  }
                  if (report.id === 'worksafe-bc') {
                    void handleWorkSafeBCExport();
                    return;
                  }
                  if (!report.available) {
                    toast.info('Coming Soon', `${report.name} generation is coming in a future update.`);
                    return;
                  }

                  toast.info('Coming Soon', `${report.name} generation is coming in a future update.`);
                }}
                disabled={filteredEntries.length === 0}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200',
                  filteredEntries.length === 0
                    ? 'border-border/60 opacity-50 cursor-not-allowed'
                    : 'border-border/60 hover:border-primary/30 hover:bg-muted/30 cursor-pointer group'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-border/60 group-hover:bg-primary/10 group-hover:ring-primary/20 transition-colors">
                    <report.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{report.name}</h3>
                      <Badge variant={report.badge === 'WCB' ? 'default' : 'secondary'} className="text-xs rounded-full">
                        {report.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{report.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports Section */}
      <Card className="rounded-2xl border border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-semibold tracking-tight">Scheduled Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/60 mb-4">
              <Calendar className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">No Scheduled Reports</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set up automated reports to be generated on a schedule.
            </p>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => toast.info('Coming Soon', 'Scheduled reports will be available in a future update.')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule a Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card className="rounded-2xl border border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-semibold tracking-tight">Recent Exports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Your export history will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportsPage;

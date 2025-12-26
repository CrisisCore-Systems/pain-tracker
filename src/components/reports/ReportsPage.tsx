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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Export</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Export your pain tracking data or generate specialized reports
          </p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Select date range"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Export Preview / What's Included */}
      <Card className="border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-900/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-sky-700 dark:text-sky-300" />
              What exports include
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
          <p className="text-sm text-sky-900/80 dark:text-sky-100/80">
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
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                  <stat.icon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Data Warning */}
      {filteredEntries.length === 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900 dark:text-amber-100">No Data Available</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {dateRange === 'all' 
                    ? "You haven't logged any pain entries yet. Start tracking to generate reports."
                    : `No entries found for the selected time period. Try selecting a different date range.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Quick Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={report.action}
                disabled={isExporting !== null || filteredEntries.length === 0}
                className={`
                  relative p-4 rounded-xl border-2 border-dashed transition-all duration-200
                  ${filteredEntries.length === 0 
                    ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                    : `border-${report.color}-200 dark:border-${report.color}-800 hover:border-${report.color}-400 dark:hover:border-${report.color}-600 hover:bg-${report.color}-50 dark:hover:bg-${report.color}-900/20 cursor-pointer`
                  }
                  ${isExporting === report.id ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-400 dark:border-sky-600' : ''}
                `}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`p-3 rounded-xl bg-${report.color}-100 dark:bg-${report.color}-900/30`}>
                    {isExporting === report.id ? (
                      <div className="h-6 w-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <report.icon className={`h-6 w-6 text-${report.color}-600 dark:text-${report.color}-400`} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{report.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{report.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {report.format}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specialized Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Specialized Reports
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
                className={`
                  w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                  ${filteredEntries.length === 0
                    ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <report.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{report.name}</h3>
                      <Badge variant={report.badge === 'WCB' ? 'default' : 'secondary'} className="text-xs">
                        {report.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{report.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">No Scheduled Reports</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Set up automated reports to be generated on a schedule.
            </p>
            <Button
              variant="outline"
              onClick={() => toast.info('Coming Soon', 'Scheduled reports will be available in a future update.')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule a Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Recent Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your export history will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportsPage;

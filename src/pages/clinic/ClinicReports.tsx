import React, { useState } from 'react';
import { 
  FileText, 
  BarChart3, 
  Download, 
  Filter, 
  Clock, 
  FileSpreadsheet, 
  FileJson, 
  FileType,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { cn } from '../../design-system/utils';
import type { ClinicReportTemplate, GeneratedReport } from '../../types/clinic';

export function ClinicReports() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const [templates] = useState<ClinicReportTemplate[]>([
    {
      id: 'RPT-001',
      name: 'Monthly Population Health',
      description: 'Aggregate pain levels, symptom distribution, and improvement rates.',
      format: 'PDF',
      category: 'population',
      lastRun: '2025-10-31'
    },
    {
      id: 'RPT-002',
      name: 'WorkSafeBC Compliance Summary',
      description: 'Overview of active claims and required reporting status.',
      format: 'CSV',
      category: 'compliance',
      lastRun: '2025-11-15'
    },
    {
      id: 'RPT-003',
      name: 'Clinic Operational Metrics',
      description: 'Appointment volume, cancellation rates, and provider utilization.',
      format: 'Excel',
      category: 'operational',
      lastRun: '2025-11-18'
    },
    {
      id: 'RPT-004',
      name: 'Opioid Prescribing & Outcomes',
      description: 'Correlation between medication adherence and pain reduction.',
      format: 'PDF',
      category: 'population',
      lastRun: '2025-09-30'
    }
  ]);

  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([
    {
      id: 'GEN-104',
      name: 'Monthly Population Health - Oct 2025',
      templateId: 'RPT-001',
      generatedBy: 'Dr. Sarah Chen',
      date: '2025-11-01T09:00:00Z',
      status: 'ready',
      size: '2.4 MB'
    },
    {
      id: 'GEN-103',
      name: 'Clinic Operational Metrics - Wk 45',
      templateId: 'RPT-003',
      generatedBy: 'System',
      date: '2025-11-18T23:59:00Z',
      status: 'ready',
      size: '450 KB'
    },
    {
      id: 'GEN-102',
      name: 'WorkSafeBC Compliance P1',
      templateId: 'RPT-002',
      generatedBy: 'Nurse James',
      date: '2025-11-15T14:30:00Z',
      status: 'ready',
      size: '120 KB'
    }
  ]);

  const handleGenerate = (templateId: string) => {
    setIsGenerating(templateId);
    // Simulate generation
    setTimeout(() => {
        setIsGenerating(null);
        const template = templates.find(t => t.id === templateId);
        if (template) {
            const newReport: GeneratedReport = {
                id: `GEN-${Date.now()}`,
                name: `${template.name} - ${new Date().toLocaleDateString()}`,
                templateId: template.id,
                generatedBy: 'Current User',
                date: new Date().toISOString(),
                status: 'ready',
                size: 'PENDING'
            };
            setRecentReports([newReport, ...recentReports]);
        }
    }, 2000);
  };

  const getFormatIcon = (format: ClinicReportTemplate['format']) => {
    switch (format) {
      case 'PDF': return <FileType className="h-4 w-4 text-red-500" />;
      case 'CSV': return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'Excel': return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'JSON': return <FileJson className="h-4 w-4 text-orange-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Clinical Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Population health analytics and operational exports
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Templates Section */}
        <div className="md:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Available Reports
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
                {templates.map(template => (
                    <Card key={template.id} className="hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="mb-2">
                                    {template.category}
                                </Badge>
                                {getFormatIcon(template.format)}
                            </div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                                {template.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
                                <div className="text-xs text-slate-500">
                                    Last run: {template.lastRun}
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="secondary"
                                    onClick={() => handleGenerate(template.id)}
                                    disabled={isGenerating === template.id}
                                >
                                    {isGenerating === template.id ? (
                                        <>
                                            <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>Generate</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            {/* Quick Stats Banner */}
             <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Reports Generated</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">154</div>
                </div>
                 <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Scheduled Jobs</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3</div>
                </div>
                 <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">Data Freshness</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Live</div>
                </div>
            </div>
        </div>

        {/* History Sidebar */}
         <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
            </h2>
            <Card className="bg-slate-50/50 dark:bg-slate-900/50">
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {recentReports.map(report => (
                            <div key={report.id} className="p-4 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1">
                                            {report.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(report.date).toLocaleDateString()} • {report.size}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            by {report.generatedBy}
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
                <p className="flex items-start gap-2">
                    <Filter className="h-4 w-4 mt-0.5 shrink-0" />
                    Custom queries can be built in the Data Explorer tab (requires 'Analyst' role).
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ClinicReports;

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Modal, Badge, Input } from '../../design-system';
import { FileText, Download, Calendar, Clock, Settings, Plus, Trash2, Eye, Send } from 'lucide-react';
import type { PainEntry, ReportTemplate, ScheduledReport } from '../../types';
import { generatePDFReport, downloadPDF } from '../../utils/pdfReportGenerator';

interface ReportingSystemProps {
  entries: PainEntry[];
  onGenerateReport: (template: ReportTemplate, dateRange: { start: string; end: string }) => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'weekly-summary',
    name: 'Weekly Pain Summary',
    description: 'Overview of pain patterns and trends for the past week',
    type: 'summary',
    sections: [
      {
        id: 'pain-trends',
        title: 'Pain Level Trends',
        type: 'chart',
        dataSource: 'pain-levels',
        config: { period: '7d', chartType: 'line' }
      },
      {
        id: 'symptoms-summary',
        title: 'Common Symptoms',
        type: 'table',
        dataSource: 'symptoms',
        config: { groupBy: 'frequency', limit: 10 }
      },
      {
        id: 'medication-effectiveness',
        title: 'Medication Effectiveness',
        type: 'metrics',
        dataSource: 'medications',
        config: { showEffectiveness: true }
      }
    ],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
  {
    id: 'monthly-clinical',
    name: 'Monthly Clinical Report',
    description: 'Detailed clinical report for healthcare providers',
    type: 'clinical',
    sections: [
      {
        id: 'patient-overview',
        title: 'Patient Overview',
        type: 'text',
        dataSource: 'overview',
        config: { includeDemographics: true }
      },
      {
        id: 'pain-analysis',
        title: 'Pain Analysis',
        type: 'chart',
        dataSource: 'pain-analysis',
        config: { period: '30d', includeStats: true }
      },
      {
        id: 'functional-impact',
        title: 'Functional Impact Assessment',
        type: 'table',
        dataSource: 'functional-impact',
        config: { detailed: true }
      },
      {
        id: 'treatment-summary',
        title: 'Treatment Summary',
        type: 'text',
        dataSource: 'treatments',
        config: { includeEffectiveness: true }
      }
    ],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
  {
    id: 'progress-report',
    name: 'Progress Report',
    description: 'Track improvements and changes over time',
    type: 'progress',
    sections: [
      {
        id: 'progress-metrics',
        title: 'Key Progress Metrics',
        type: 'metrics',
        dataSource: 'progress',
        config: { comparePeriods: true }
      },
      {
        id: 'improvement-trends',
        title: 'Improvement Trends',
        type: 'chart',
        dataSource: 'trends',
        config: { showImprovements: true }
      },
      {
        id: 'goals-achievement',
        title: 'Goals Achievement',
        type: 'table',
        dataSource: 'goals',
        config: { showCompletion: true }
      }
    ],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }
];

export function ReportingSystem({
  entries,
  onGenerateReport,
  onDeleteSchedule
}: ReportingSystemProps) {
  const [templates] = useState<ReportTemplate[]>(DEFAULT_TEMPLATES);
  const [scheduledReports] = useState<ScheduledReport[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportDateRange, setReportDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Generate report data based on template and date range
  const generateReportData = useMemo(() => {
    if (!selectedTemplate) return null;

    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const startDate = new Date(reportDateRange.start);
      const endDate = new Date(reportDateRange.end);
      return entryDate >= startDate && entryDate <= endDate;
    });

    const reportData: Record<string, unknown> = {
      period: {
        start: reportDateRange.start,
        end: reportDateRange.end,
        totalEntries: filteredEntries.length
      },
      summary: {
        avgPainLevel: filteredEntries.length > 0
          ? filteredEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / filteredEntries.length
          : 0,
        mostCommonLocation: getMostCommon(filteredEntries.flatMap(e => e.baselineData.locations)),
        mostCommonSymptom: getMostCommon(filteredEntries.flatMap(e => e.baselineData.symptoms)),
        totalMedications: new Set(filteredEntries.flatMap(e => e.medications.current.map(m => m.name))).size
      }
    };

    return reportData;
  }, [selectedTemplate, entries, reportDateRange]);

  const getMostCommon = (items: string[]): string => {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
  };

  const handleGenerateReport = async () => {
    if (selectedTemplate) {
      try {
        // Generate PDF report
        const pdfBlob = await generatePDFReport({
          template: selectedTemplate,
          entries,
          dateRange: {
            start: reportDateRange.start + 'T00:00:00Z',
            end: reportDateRange.end + 'T23:59:59Z'
          }
        });

        // Download the PDF
        const filename = `${selectedTemplate.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        downloadPDF(pdfBlob, filename);

        // Also call the original onGenerateReport for any additional processing
        onGenerateReport(selectedTemplate, reportDateRange);
      } catch (error) {
        console.error('Failed to generate PDF report:', error);
        // Fallback to original behavior
        onGenerateReport(selectedTemplate, reportDateRange);
      }
    }
  };

  const handleScheduleReport = (templateId: string) => {
    setSelectedTemplate(templates.find(t => t.id === templateId) || null);
    setShowScheduleModal(true);
  };

  const getTemplateIcon = (type: ReportTemplate['type']) => {
    switch (type) {
      case 'summary': return '📊';
      case 'detailed': return '📋';
      case 'clinical': return '🏥';
      case 'progress': return '📈';
      default: return '📄';
    }
  };

  const getFrequencyLabel = (frequency: ScheduledReport['frequency']) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return frequency;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reporting System</h2>
          <p className="text-muted-foreground">
            Generate automated reports and schedule regular deliveries
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowTemplateModal(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Templates
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowScheduleModal(true)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Quick Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Generate Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Template</label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTemplate(templates.find(t => t.id === e.target.value) || null)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a template...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {getTemplateIcon(template.type)} {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                value={reportDateRange.start}
                onChange={(e) => setReportDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="date"
                value={reportDateRange.end}
                onChange={(e) => setReportDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          {selectedTemplate && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{selectedTemplate.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{selectedTemplate.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <span>Sections: {selectedTemplate.sections.length}</span>
                  <Badge variant="outline">{selectedTemplate.type}</Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleReport(selectedTemplate.id)}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={!generateReportData}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Report Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{getTemplateIcon(template.type)}</div>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{template.sections.length} sections</span>
                    <span>Modified {new Date(template.lastModified).toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setReportDateRange({
                          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          end: new Date().toISOString().split('T')[0]
                        });
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Select
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScheduleReport(template.id)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      {scheduledReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Scheduled Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledReports.map(schedule => {
                const template = templates.find(t => t.id === schedule.templateId);
                return (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">{template ? getTemplateIcon(template.type) : '📄'}</div>
                      <div>
                        <h4 className="font-medium">{schedule.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template?.name} • {getFrequencyLabel(schedule.frequency)} •
                          Next: {new Date(schedule.nextRun).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={schedule.isActive ? "default" : "secondary"}>
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSchedule(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Management Modal */}
      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} size="lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Manage Report Templates</h2>
            <Button variant="ghost" onClick={() => setShowTemplateModal(false)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTemplateIcon(template.type)}</span>
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Close
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Report Modal */}
      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Schedule Report</h2>
            <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {selectedTemplate && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">{selectedTemplate.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Schedule Name</label>
              <Input placeholder="e.g., Weekly Summary Report" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Frequency</label>
              <select className="w-full p-2 border rounded">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recipients (Email)</label>
              <Input placeholder="email@example.com" />
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple emails with commas
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle schedule creation
              setShowScheduleModal(false);
            }}>
              <Send className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

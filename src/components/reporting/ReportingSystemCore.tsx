import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Modal, Badge, Input } from '../../design-system';
import { Calendar, Clock, Trash2, Send } from 'lucide-react';
import type { PainEntry, ReportTemplate, ScheduledReport } from '../../types';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { Switch } from '../ui/switch';

interface ReportingSystemProps { entries: PainEntry[]; }

const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'weekly-summary',
    name: 'Weekly Pain Summary',
    description: 'Overview of pain patterns and trends for the past week',
    type: 'summary',
    sections: [],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
];

function ReportingSystemCore({ entries: _entries }: ReportingSystemProps) {
  void _entries;
  const [templates] = useState<ReportTemplate[]>(DEFAULT_TEMPLATES);
  const scheduledReports = usePainTrackerStore(state => state.scheduledReports);
  const addScheduledReport = usePainTrackerStore(state => state.addScheduledReport);
  const deleteScheduledReport = usePainTrackerStore(state => state.deleteScheduledReport);
  const updateScheduledReport = usePainTrackerStore(state => state.updateScheduledReport);
  const runScheduledReport = usePainTrackerStore(state => state.runScheduledReport);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState<ScheduledReport['frequency']>('weekly');
  const [scheduleRecipients, setScheduleRecipients] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(templates[0] || null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null);

  const calculateNextRun = (frequency: ScheduledReport['frequency']) => {
    const d = new Date();
    if (frequency === 'daily') d.setDate(d.getDate() + 1);
    else if (frequency === 'weekly') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    return d.toISOString();
  };

  const handleCreateSchedule = () => {
    if (!selectedTemplate) return;
    const id = `schedule-${Date.now()}`;
    const recipients = scheduleRecipients.split(',').map(r => r.trim()).filter(Boolean);
    const schedule: ScheduledReport = { id, templateId: selectedTemplate.id, name: scheduleName || `${selectedTemplate.name} - ${scheduleFrequency}`, frequency: scheduleFrequency, recipients, nextRun: calculateNextRun(scheduleFrequency), lastRun: undefined, isActive: true };
    // If we are editing an existing schedule, update it instead
  if (editingSchedule) {
      // Call updateScheduledReport on store to modify the schedule
      const updates: Partial<ScheduledReport> = { name: schedule.name, frequency: schedule.frequency, recipients: schedule.recipients, templateId: schedule.templateId };
      // We need to set nextRun based on frequency
      updates.nextRun = calculateNextRun(schedule.frequency);
  updateScheduledReport(editingSchedule.id, updates);
      setEditingSchedule(null);
    } else {
      addScheduledReport(schedule);
    }
    setShowScheduleModal(false);
    setScheduleName('');
    setScheduleRecipients('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reporting System</h2>
        </div>
        <div>
          <Button variant="outline" onClick={() => setShowScheduleModal(true)}>
            <Calendar className="h-4 w-4 mr-2" />Schedule Report
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Report Template</label>
          <select value={selectedTemplate?.id || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTemplate(templates.find(t => t.id === e.target.value) || null)} className="w-full p-2 border rounded">
            <option value="">Select a template...</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <section>
                    <h4 className="font-medium mb-2">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  </section>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedTemplate(template); setShowScheduleModal(true); }}>
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
                    <div>
                      <h4 className="font-medium">{schedule.name}</h4>
                      <p className="text-sm text-muted-foreground">{template?.name} • {schedule.frequency} • Next: {new Date(schedule.nextRun).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={schedule.isActive ? 'default' : 'secondary'}>{schedule.isActive ? 'Active' : 'Inactive'}</Badge>
                      <div className="flex items-center gap-2">
                        <Switch checked={schedule.isActive} onCheckedChange={(checked) => updateScheduledReport(schedule.id, { isActive: checked })} className="h-5 w-10" aria-label={`Toggle schedule ${schedule.name}`} />
                        <Button variant="outline" size="sm" onClick={() => runScheduledReport(schedule.id)} aria-label={`Run now ${schedule.name}`}>Run now</Button>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {
                        // Open modal prefilled for editing
                        setEditingSchedule(schedule);
                        setShowScheduleModal(true);
                        setScheduleName(schedule.name);
                        setScheduleFrequency(schedule.frequency);
                        setScheduleRecipients((schedule.recipients || []).join(', '));
                        setSelectedTemplate(templates.find(t => t.id === schedule.templateId) || null);
                      }}>Edit</Button>
                      <Button variant="ghost" size="sm" aria-label={`Delete ${schedule.name}`} onClick={() => deleteScheduledReport(schedule.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)}>
        <div className="space-y-6">
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Schedule Report</h2><Button variant="ghost" onClick={() => setShowScheduleModal(false)}><Trash2 className="h-4 w-4" /></Button></div>

          {selectedTemplate && (<div className="bg-muted/50 p-4 rounded-lg"><h3 className="font-medium mb-2">{selectedTemplate.name}</h3><p className="text-sm text-muted-foreground">{selectedTemplate.description}</p></div>)}

          <div className="space-y-4">
            <div>
          <label htmlFor="schedule-name" className="block text-sm font-medium mb-2">Schedule Name</label>
            <Input id="schedule-name" placeholder="e.g., Weekly Summary Report" value={scheduleName} onChange={e => setScheduleName((e.target as HTMLInputElement).value)} />
            </div>

            <div>
              <label htmlFor="schedule-frequency" className="block text-sm font-medium mb-2">Frequency</label>
              <select id="schedule-frequency" className="w-full p-2 border rounded" value={scheduleFrequency} onChange={e => setScheduleFrequency((e.target as HTMLSelectElement).value as ScheduledReport['frequency'])}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="daily">Daily</option></select>
            </div>

            <div>
              <label htmlFor="schedule-recipients" className="block text-sm font-medium mb-2">Recipients (Email)</label>
              <Input id="schedule-recipients" placeholder="email@example.com" value={scheduleRecipients} onChange={e => setScheduleRecipients((e.target as HTMLInputElement).value)} />
              <p className="text-xs text-muted-foreground mt-1">Separate multiple emails with commas</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
            <Button onClick={() => handleCreateSchedule()}><Send className="h-4 w-4 mr-2" />Schedule Report</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ReportingSystemCore;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../design-system';
import { AccessibilitySettingsPanel } from '../components/accessibility/AccessibilitySettings';
import AlertsSettings from '../components/AlertsSettings';
import { NotificationManagement } from '../components/notifications/NotificationManagement';
import NotificationPreferencesPanel from '../components/settings/NotificationPreferencesPanel';
import BackupSettings from '../components/settings/BackupSettings';
import CloudBackupSettings from '../components/settings/CloudBackupSettings';
import ExportSettings from '../components/settings/ExportSettings';
import PrivacySettings from '../components/settings/PrivacySettings';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AccessibilitySettingsPanel />
          <NotificationPreferencesPanel />
          <PrivacySettings />
          <Card>
            <CardHeader>
              <CardTitle>Manage notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationManagement />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <AlertsSettings variant="inline" />
          <CloudBackupSettings />
          <ExportSettings />
          <BackupSettings />
        </div>
      </div>
    </div>
  );
}

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
import { useBiophilicTheme } from '../hooks';
import { Leaf } from 'lucide-react';

export default function SettingsPage() {
  const { enabled: biophilicEnabled, toggle: toggleBiophilic } = useBiophilicTheme();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Adjust how Pain Tracker looks, notifies you, and protects your information. You stay in
          control, and you can change these settings at any time.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-labelledby="settings-accessibility" className="space-y-6">
          <div>
            <h3
              id="settings-accessibility"
              className="text-sm font-semibold text-muted-foreground mb-2"
            >
              Accessibility &amp; comfort
            </h3>
            <AccessibilitySettingsPanel />

            {/* Biophilic (Nature) Theme Toggle */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Leaf className="h-4 w-4 text-green-600" aria-hidden="true" />
                  Nature Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-muted-foreground flex-1 min-w-0">
                    Apply a calming, nature-inspired theme for a more restful experience.
                  </p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={biophilicEnabled}
                    onClick={toggleBiophilic}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      biophilicEnabled 
                        ? 'bg-green-600 border-green-600' 
                        : 'bg-gray-300 border-gray-300 dark:bg-gray-600 dark:border-gray-600'
                    }`}
                  >
                    <span className="sr-only">Enable nature theme</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        biophilicEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          <section aria-labelledby="settings-notifications" className="space-y-4">
            <h3
              id="settings-notifications"
              className="text-sm font-semibold text-muted-foreground"
            >
              Notifications &amp; alerts
            </h3>
            <NotificationPreferencesPanel />
            <Card>
              <CardHeader>
                <CardTitle>Manage notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationManagement />
              </CardContent>
            </Card>
            <AlertsSettings variant="inline" />
          </section>

          <section aria-labelledby="settings-privacy" className="space-y-2">
            <h3
              id="settings-privacy"
              className="text-sm font-semibold text-muted-foreground"
            >
              Privacy &amp; data
            </h3>
            <PrivacySettings />
          </section>
        </section>

        <section
          aria-labelledby="settings-backup-export"
          className="space-y-6"
        >
          <div className="space-y-4">
            <h3
              id="settings-backup-export"
              className="text-sm font-semibold text-muted-foreground"
            >
              Backup &amp; export
            </h3>
            <CloudBackupSettings />
            <ExportSettings />
            <BackupSettings />
          </div>
        </section>
      </div>
    </div>
  );
}

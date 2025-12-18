import React from 'react';
import { AccessibilitySettingsPanel } from '../components/accessibility/AccessibilitySettings';
import AlertsSettings from '../components/AlertsSettings';
import { NotificationManagement } from '../components/notifications/NotificationManagement';
import NotificationPreferencesPanel from '../components/settings/NotificationPreferencesPanel';
import BackupSettings from '../components/settings/BackupSettings';
import CloudBackupSettings from '../components/settings/CloudBackupSettings';
import ExportSettings from '../components/settings/ExportSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import { Settings, Bell, Shield, Download, Eye } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30"
          >
            <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Customize your experience and protect your information
            </p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-slate-500 max-w-2xl leading-relaxed">
          Adjust how Pain Tracker looks, notifies you, and protects your information. You stay in
          control, and you can change these settings at any time.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <section aria-labelledby="settings-accessibility" className="space-y-6">
          {/* Accessibility Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <h3
                id="settings-accessibility"
                className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Accessibility &amp; Comfort
              </h3>
            </div>
            <AccessibilitySettingsPanel />
          </div>

          {/* Notifications Section */}
          <section aria-labelledby="settings-notifications" className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3
                id="settings-notifications"
                className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Notifications &amp; Alerts
              </h3>
            </div>
            <NotificationPreferencesPanel />
            <div
              className="rounded-xl overflow-hidden bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg"
            >
              <div className="p-4 border-b border-gray-200 dark:border-white/5">
                <h4 className="font-semibold text-gray-900 dark:text-white">Manage Notifications</h4>
              </div>
              <div className="p-4">
                <NotificationManagement />
              </div>
            </div>
            <AlertsSettings variant="inline" />
          </section>

          {/* Privacy Section */}
          <section aria-labelledby="settings-privacy" className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3
                id="settings-privacy"
                className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Privacy &amp; Data
              </h3>
            </div>
            <PrivacySettings />
          </section>
        </section>

        {/* Right Column */}
        <section
          aria-labelledby="settings-backup-export"
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <h3
                id="settings-backup-export"
                className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Backup &amp; Export
              </h3>
            </div>
            <CloudBackupSettings />
            <ExportSettings />
            <BackupSettings />
          </div>
        </section>
      </div>
    </div>
  );
}

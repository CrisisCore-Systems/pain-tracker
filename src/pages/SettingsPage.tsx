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
import { Leaf, Settings, Sparkles, Bell, Shield, Download, Eye, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { enabled: biophilicEnabled, toggle: toggleBiophilic } = useBiophilicTheme();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <Settings className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <p className="text-sm text-slate-400">
              Customize your experience and protect your information
            </p>
          </div>
        </div>
        <p className="text-slate-500 max-w-2xl leading-relaxed">
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
              <Eye className="h-4 w-4 text-sky-400" />
              <h3
                id="settings-accessibility"
                className="text-sm font-semibold text-slate-300 uppercase tracking-wider"
              >
                Accessibility &amp; Comfort
              </h3>
            </div>
            <AccessibilitySettingsPanel />

            {/* Biophilic (Nature) Theme Toggle - Premium Card */}
            <div
              className="rounded-xl p-5 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                    }}
                  >
                    <Leaf className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Nature Theme</h4>
                    <p className="text-sm text-slate-400 mt-1">
                      Apply a calming, nature-inspired theme for a more restful experience.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={biophilicEnabled}
                  onClick={toggleBiophilic}
                  className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                  style={{
                    background: biophilicEnabled 
                      ? 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)' 
                      : 'rgba(51, 65, 85, 0.8)',
                    boxShadow: biophilicEnabled ? '0 4px 15px rgba(34, 197, 94, 0.3)' : 'none',
                  }}
                >
                  <span className="sr-only">Enable nature theme</span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out"
                    style={{
                      transform: biophilicEnabled ? 'translateX(22px)' : 'translateX(2px)',
                      marginTop: '2px',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <section aria-labelledby="settings-notifications" className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-400" />
              <h3
                id="settings-notifications"
                className="text-sm font-semibold text-slate-300 uppercase tracking-wider"
              >
                Notifications &amp; Alerts
              </h3>
            </div>
            <NotificationPreferencesPanel />
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <h4 className="font-semibold text-white">Manage Notifications</h4>
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
              <Shield className="h-4 w-4 text-emerald-400" />
              <h3
                id="settings-privacy"
                className="text-sm font-semibold text-slate-300 uppercase tracking-wider"
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
              <Download className="h-4 w-4 text-cyan-400" />
              <h3
                id="settings-backup-export"
                className="text-sm font-semibold text-slate-300 uppercase tracking-wider"
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

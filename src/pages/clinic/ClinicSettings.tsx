/**
 * Clinic Settings - Portal configuration and preferences
 */

import { Save, Bell, Shield, Users, Palette } from 'lucide-react';
import { useState } from 'react';

export function ClinicSettings() {
  const [settings, setSettings] = useState({
    clinicName: 'Pain Management Clinic',
    timezone: 'America/Vancouver',
    defaultAppointmentDuration: 30,
    enableEmailNotifications: true,
    enableSMSReminders: false,
    hipaaAuditLevel: 'full',
    dataRetentionDays: 2555, // 7 years
    theme: 'light'
  });

  const handleSave = () => {
    // In production, save to API
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Clinic Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Configure portal preferences and clinical workflows
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                General Settings
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Basic clinic information and preferences
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Clinic Name
            </label>
            <input
              type="text"
              value={settings.clinicName}
              onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="America/Vancouver">Pacific Time (PT)</option>
              <option value="America/Edmonton">Mountain Time (MT)</option>
              <option value="America/Winnipeg">Central Time (CT)</option>
              <option value="America/Toronto">Eastern Time (ET)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Default Appointment Duration (minutes)
            </label>
            <input
              type="number"
              value={settings.defaultAppointmentDuration}
              onChange={(e) => setSettings({ ...settings, defaultAppointmentDuration: parseInt(e.target.value) })}
              min="15"
              step="15"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Notifications
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Configure alert and reminder preferences
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Email Notifications
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Receive alerts and updates via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                SMS Reminders
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Send appointment reminders via SMS
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSMSReminders}
                onChange={(e) => setSettings({ ...settings, enableSMSReminders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security & Compliance */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Security & Compliance
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                HIPAA audit and data retention settings
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              HIPAA Audit Level
            </label>
            <select
              value={settings.hipaaAuditLevel}
              onChange={(e) => setSettings({ ...settings, hipaaAuditLevel: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="full">Full (All Actions)</option>
              <option value="standard">Standard (Data Access Only)</option>
              <option value="minimal">Minimal (Critical Events Only)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Data Retention Period (days)
            </label>
            <input
              type="number"
              value={settings.dataRetentionDays}
              onChange={(e) => setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) })}
              min="365"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Recommended: 2555 days (7 years) for medical records compliance
            </p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Appearance
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Customize portal theme and display
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setSettings({ ...settings, theme: 'light' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-600 hover:border-blue-300'
              }`}
            >
              <div className="w-full h-20 bg-white rounded mb-2 border border-slate-200"></div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Light</p>
            </button>
            <button
              onClick={() => setSettings({ ...settings, theme: 'dark' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-600 hover:border-blue-300'
              }`}
            >
              <div className="w-full h-20 bg-slate-900 rounded mb-2"></div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Dark</p>
            </button>
            <button
              onClick={() => setSettings({ ...settings, theme: 'auto' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.theme === 'auto'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-600 hover:border-blue-300'
              }`}
            >
              <div className="w-full h-20 bg-gradient-to-r from-white to-slate-900 rounded mb-2"></div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Auto</p>
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
}

/**
 * Clinic Settings - Portal configuration and preferences
 */

import { Save, Bell, Shield, Users, Palette, Settings, CheckCircle2 } from 'lucide-react';
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
    theme: 'dark'
  });

  const handleSave = () => {
    // In production, save to API
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl bg-slate-900 min-h-screen">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Page Header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-600/20 border border-slate-500/30">
            <Settings className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Clinic Settings
            </h1>
            <p className="text-slate-400">
              Configure portal preferences and clinical workflows
            </p>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div 
        className="relative rounded-2xl border border-slate-700/50 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-500" />
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/30">
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                General Settings
              </h2>
              <p className="text-sm text-slate-400">
                Basic clinic information and preferences
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Clinic Name
            </label>
            <input
              type="text"
              value={settings.clinicName}
              onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
            >
              <option value="America/Vancouver">Pacific Time (PT)</option>
              <option value="America/Edmonton">Mountain Time (MT)</option>
              <option value="America/Winnipeg">Central Time (CT)</option>
              <option value="America/Toronto">Eastern Time (ET)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Default Appointment Duration (minutes)
            </label>
            <input
              type="number"
              value={settings.defaultAppointmentDuration}
              onChange={(e) => setSettings({ ...settings, defaultAppointmentDuration: parseInt(e.target.value) })}
              min="15"
              step="15"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div 
        className="relative rounded-2xl border border-slate-700/50 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <Bell className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Notifications
              </h2>
              <p className="text-sm text-slate-400">
                Configure alert and reminder preferences
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div>
              <p className="font-medium text-white">
                Email Notifications
              </p>
              <p className="text-sm text-slate-400">
                Receive alerts and updates via email
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enableEmailNotifications: !settings.enableEmailNotifications })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.enableEmailNotifications ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform shadow-lg ${
                settings.enableEmailNotifications ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div>
              <p className="font-medium text-white">
                SMS Reminders
              </p>
              <p className="text-sm text-slate-400">
                Send appointment reminders via SMS
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enableSMSReminders: !settings.enableSMSReminders })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.enableSMSReminders ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform shadow-lg ${
                settings.enableSMSReminders ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Security & Compliance */}
      <div 
        className="relative rounded-2xl border border-slate-700/50 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500" />
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30">
              <Shield className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Security & Compliance
              </h2>
              <p className="text-sm text-slate-400">
                HIPAA audit and data retention settings
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              HIPAA Audit Level
            </label>
            <select
              value={settings.hipaaAuditLevel}
              onChange={(e) => setSettings({ ...settings, hipaaAuditLevel: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
            >
              <option value="full">Full (All Actions)</option>
              <option value="standard">Standard (Data Access Only)</option>
              <option value="minimal">Minimal (Critical Events Only)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Data Retention Period (days)
            </label>
            <input
              type="number"
              value={settings.dataRetentionDays}
              onChange={(e) => setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) })}
              min="365"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
            />
            <p className="text-xs text-slate-500 mt-2">
              Recommended: 2555 days (7 years) for medical records compliance
            </p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div 
        className="relative rounded-2xl border border-slate-700/50 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
              <Palette className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Appearance
              </h2>
              <p className="text-sm text-slate-400">
                Customize portal theme and display
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-300 mb-4">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setSettings({ ...settings, theme: 'light' })}
              className={`p-4 rounded-xl border-2 transition-all hover:-translate-y-1 ${
                settings.theme === 'light'
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="w-full h-16 bg-white rounded-lg mb-3 border border-slate-200"></div>
              <p className="text-sm font-medium text-white flex items-center justify-center gap-2">
                {settings.theme === 'light' && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                Light
              </p>
            </button>
            <button
              onClick={() => setSettings({ ...settings, theme: 'dark' })}
              className={`p-4 rounded-xl border-2 transition-all hover:-translate-y-1 ${
                settings.theme === 'dark'
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="w-full h-16 bg-slate-800 rounded-lg mb-3"></div>
              <p className="text-sm font-medium text-white flex items-center justify-center gap-2">
                {settings.theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                Dark
              </p>
            </button>
            <button
              onClick={() => setSettings({ ...settings, theme: 'auto' })}
              className={`p-4 rounded-xl border-2 transition-all hover:-translate-y-1 ${
                settings.theme === 'auto'
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="w-full h-16 bg-gradient-to-r from-white to-slate-800 rounded-lg mb-3"></div>
              <p className="text-sm font-medium text-white flex items-center justify-center gap-2">
                {settings.theme === 'auto' && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                Auto
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="relative flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-medium transition-all hover:-translate-y-0.5 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
          }}
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
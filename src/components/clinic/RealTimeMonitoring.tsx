import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Pill,
  Activity,
  Bell,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface PatientAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: 'pain_escalation' | 'medication_missed' | 'treatment_overdue' | 'crisis_detected';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  actionRequired: boolean;
  acknowledged: boolean;
}

interface MonitoringMetrics {
  patientsAtRisk: number;
  activeAlerts: number;
  medicationAdherence: number;
  avgResponseTime: number;
}

export const RealTimeMonitoring: React.FC = () => {
  const [alerts, setAlerts] = useState<PatientAlert[]>([
    {
      id: '1',
      patientId: '101',
      patientName: 'Sarah Johnson',
      type: 'pain_escalation',
      severity: 'critical',
      message: 'Pain level increased from 4/10 to 8/10 in last 24 hours',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      actionRequired: true,
      acknowledged: false,
    },
    {
      id: '2',
      patientId: '102',
      patientName: 'Michael Chen',
      type: 'medication_missed',
      severity: 'warning',
      message: 'Missed evening medication for 2 consecutive days',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      actionRequired: true,
      acknowledged: false,
    },
    {
      id: '3',
      patientId: '103',
      patientName: 'Emma Wilson',
      type: 'crisis_detected',
      severity: 'critical',
      message: 'Crisis language detected in latest pain entry notes',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      actionRequired: true,
      acknowledged: false,
    },
    {
      id: '4',
      patientId: '104',
      patientName: 'David Martinez',
      type: 'treatment_overdue',
      severity: 'warning',
      message: 'Physical therapy appointment overdue by 3 days',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      actionRequired: true,
      acknowledged: false,
    },
  ]);

  const [metrics, setMetrics] = useState<MonitoringMetrics>({
    patientsAtRisk: 3,
    activeAlerts: 4,
    medicationAdherence: 87,
    avgResponseTime: 12,
  });

  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new alerts appearing
      const shouldAddAlert = Math.random() > 0.9;
      
      if (shouldAddAlert) {
        const newAlert: PatientAlert = {
          id: `alert-${Date.now()}`,
          patientId: `${Math.floor(Math.random() * 200) + 100}`,
          patientName: ['John Doe', 'Jane Smith', 'Robert Brown', 'Lisa Davis'][Math.floor(Math.random() * 4)],
          type: ['pain_escalation', 'medication_missed', 'treatment_overdue', 'crisis_detected'][
            Math.floor(Math.random() * 4)
          ] as PatientAlert['type'],
          severity: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)] as PatientAlert['severity'],
          message: 'New monitoring alert detected',
          timestamp: new Date().toISOString(),
          actionRequired: true,
          acknowledged: false,
        };

        setAlerts((prev) => [newAlert, ...prev].slice(0, 10));
        setMetrics((prev) => ({
          ...prev,
          activeAlerts: prev.activeAlerts + 1,
        }));
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
    setMetrics((prev) => ({
      ...prev,
      activeAlerts: prev.activeAlerts - 1,
    }));
  };

  const handleDismiss = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    setMetrics((prev) => ({
      ...prev,
      activeAlerts: prev.activeAlerts - 1,
    }));
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (!showAcknowledged && alert.acknowledged) return false;
    if (filter === 'all') return true;
    return alert.severity === filter;
  });

  const getAlertIcon = (type: PatientAlert['type']) => {
    switch (type) {
      case 'pain_escalation':
        return <TrendingUp className="w-5 h-5" />;
      case 'medication_missed':
        return <Pill className="w-5 h-5" />;
      case 'treatment_overdue':
        return <Clock className="w-5 h-5" />;
      case 'crisis_detected':
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertColor = (severity: PatientAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-500';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-500';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Patients at Risk</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{metrics.patientsAtRisk}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-600">+2 since yesterday</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Alerts</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.activeAlerts}</p>
            </div>
            <Bell className="w-8 h-8 text-amber-600" />
          </div>
          <div className="mt-2 flex items-center gap-1">
            <Activity className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-600">Requires attention</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Med Adherence</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{metrics.medicationAdherence}%</p>
            </div>
            <Pill className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600">+3% this week</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Response</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{metrics.avgResponseTime}m</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600">-2m improvement</span>
          </div>
        </div>
      </div>

      {/* Alert Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'critical', 'warning', 'info'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-sm">
                    {alerts.filter((a) => a.severity === f && !a.acknowledged).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAcknowledged}
              onChange={(e) => setShowAcknowledged(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Show acknowledged</span>
          </label>
        </div>
      </div>

      {/* Alert List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Real-Time Alerts
            <span className="ml-2 text-sm font-normal text-slate-600 dark:text-slate-400">
              ({filteredAlerts.length} alerts)
            </span>
          </h2>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">No active alerts</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                All patients are being monitored normally
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border-l-4 ${getAlertColor(alert.severity)} ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        alert.severity === 'critical'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                          : alert.severity === 'warning'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      }`}
                    >
                      {getAlertIcon(alert.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {alert.patientName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            alert.severity === 'critical'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : alert.severity === 'warning'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                        {alert.acknowledged && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Acknowledged
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                        {alert.actionRequired && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            Action required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        title="Acknowledge"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      title="Dismiss"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

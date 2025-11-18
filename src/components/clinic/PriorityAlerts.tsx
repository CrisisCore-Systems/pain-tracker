/**
 * Priority Alerts - Critical patient alerts requiring immediate attention
 */

import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  severity: 'critical' | 'high' | 'medium';
  type: 'pain-escalation' | 'missed-entry' | 'pattern-detected';
  message: string;
  timestamp: string;
}

export function PriorityAlerts() {
  // Mock data - in production, fetch from API
  const alerts: Alert[] = [
    {
      id: 'AL001',
      patientId: 'P002',
      patientName: 'Maria Garcia',
      severity: 'critical',
      type: 'pain-escalation',
      message: 'Pain level increased from 5.2 to 7.8 over 48 hours',
      timestamp: '2025-11-17T14:30:00'
    },
    {
      id: 'AL002',
      patientId: 'P005',
      patientName: 'Michael Brown',
      severity: 'high',
      type: 'pain-escalation',
      message: 'Reported pain level 8+ for 3 consecutive days',
      timestamp: '2025-11-17T10:15:00'
    },
    {
      id: 'AL003',
      patientId: 'P007',
      patientName: 'Jennifer Lee',
      severity: 'medium',
      type: 'missed-entry',
      message: 'No pain entries logged in 5 days',
      timestamp: '2025-11-17T08:00:00'
    }
  ];

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    }
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'pain-escalation':
        return <TrendingUp className="w-5 h-5" />;
      case 'missed-entry':
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Priority Alerts
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Patients requiring immediate attention
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              {alerts.length} Active
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getSeverityBadge(alert.severity)}`}>
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Link
                      to={`/clinic/patients/${alert.patientId}`}
                      className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {alert.patientName}
                    </Link>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                    {alert.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {getTimeAgo(alert.timestamp)}
                    </span>
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      Review Case →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">No priority alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}

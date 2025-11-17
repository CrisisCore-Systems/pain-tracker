/**
 * Security Monitoring Dashboard
 * Real-time security status and monitoring for the Pain Tracker application
 */

import React, { useState, useEffect, useCallback } from 'react';
import { formatNumber } from '../../utils/formatting';
import { securityService } from '../../services/SecurityService';
import { privacyAnalytics } from '../../services/PrivacyAnalyticsService';
import { validateSecurityConfig } from '../../config/security';
import type { SecurityEvent, SecurityAuditResult } from '../../services/SecurityService';

interface SecurityStatus {
  overall: 'secure' | 'warning' | 'critical';
  score: number;
  lastUpdated: Date;
}

interface SecurityMetric {
  name: string;
  value: string | number;
  status: 'good' | 'warning' | 'error';
  description: string;
}

export const SecurityDashboard: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    overall: 'secure',
    score: 0,
    lastUpdated: new Date()
  });
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'metrics' | 'config'>('overview');

  // Update security status
  const updateSecurityStatus = useCallback(async () => {
    try {
      // Get security status from service
      const status = securityService.getSecurityStatus();
      const privacyStatus = privacyAnalytics.getPrivacyStatus();
      const configValidation = validateSecurityConfig();

      // Calculate overall score
      let score = 100;
      if (!status.encryptionEnabled) score -= 20;
      if (status.recentErrors > 0) score -= (status.recentErrors * 5);
      if (!configValidation.isValid) score -= (configValidation.issues.length * 10);
      if (!privacyStatus.consentGiven) score -= 10;

      score = Math.max(0, score);

      // Determine overall status
      let overall: SecurityStatus['overall'] = 'secure';
      if (score < 70) overall = 'critical';
      else if (score < 85) overall = 'warning';

      setSecurityStatus({
        overall,
        score,
        lastUpdated: new Date()
      });

      // Update metrics
      const newMetrics: SecurityMetric[] = [
        {
          name: 'Encryption Status',
          value: status.encryptionEnabled ? 'Enabled' : 'Disabled',
          status: status.encryptionEnabled ? 'good' : 'error',
          description: 'Master key initialization and encryption readiness'
        },
        {
          name: 'Recent Security Events',
          value: status.recentEvents,
          status: status.recentEvents < 10 ? 'good' : status.recentEvents < 50 ? 'warning' : 'error',
          description: 'Security events in the last 24 hours'
        },
        {
          name: 'Security Errors',
          value: status.recentErrors,
          status: status.recentErrors === 0 ? 'good' : status.recentErrors < 5 ? 'warning' : 'error',
          description: 'Security errors in the last 24 hours'
        },
        {
          name: 'Privacy Compliance',
          value: privacyStatus.consentGiven ? 'Compliant' : 'Pending',
          status: privacyStatus.consentGiven ? 'good' : 'warning',
          description: 'User consent and privacy protection status'
        },
        {
          name: 'Configuration Issues',
          value: configValidation.issues.length,
          status: configValidation.issues.length === 0 ? 'good' : configValidation.issues.length < 3 ? 'warning' : 'error',
          description: 'Security configuration validation issues'
        },
        {
          name: 'Last Security Audit',
          value: status.lastAudit ? status.lastAudit.toLocaleDateString() : 'Never',
          status: status.lastAudit && (Date.now() - status.lastAudit.getTime()) < 7 * 24 * 60 * 60 * 1000 ? 'good' : 'warning',
          description: 'Last comprehensive security audit'
        }
      ];

      setMetrics(newMetrics);

      // Get recent events
      const events = securityService.getSecurityEvents({
        since: new Date(Date.now() - 24 * 60 * 60 * 1000),
        limit: 20
      });
      setRecentEvents(events);

    } catch (error) {
      console.error('Failed to update security status:', error);
    }
  }, []);

  // Run security audit
  const runSecurityAudit = async () => {
    setIsRunningAudit(true);
    try {
      const result = await securityService.performSecurityAudit();
      setAuditResult(result);
      
      // Update status after audit
      await updateSecurityStatus();
    } catch (error) {
      console.error('Security audit failed:', error);
    } finally {
      setIsRunningAudit(false);
    }
  };

  // Initialize dashboard
  useEffect(() => {
    updateSecurityStatus();
    
    // Set up periodic updates
    const interval = setInterval(updateSecurityStatus, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [updateSecurityStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure':
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure':
      case 'good':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
      case 'error':
        return '🚨';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Security Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time security monitoring and status</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(securityStatus.overall)}`}>
              {getStatusIcon(securityStatus.overall)} {securityStatus.overall.toUpperCase()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Score: {securityStatus.score}/100
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Updated: {securityStatus.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex space-x-4">
          <button
            onClick={runSecurityAudit}
            disabled={isRunningAudit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunningAudit ? 'Running Audit...' : 'Run Security Audit'}
          </button>
          <button
            onClick={updateSecurityStatus}
            className="px-4 py-2 bg-gray-600 dark:bg-gray-400 text-white rounded hover:bg-gray-700"
          >
            Refresh Status
          </button>
          <button
            onClick={() => securityService.clearSecurityEvents()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Events
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'events', name: 'Security Events' },
              { id: 'metrics', name: 'Metrics' },
              { id: 'config', name: 'Configuration' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'events' | 'metrics' | 'config')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Security Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{metric.name}</h3>
                        <p className="text-2xl font-bold mt-1">{metric.value}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{metric.description}</p>
                      </div>
                      <div className={`text-2xl ${getStatusColor(metric.status)} w-12 h-12 rounded-full flex items-center justify-center`}>
                        {getStatusIcon(metric.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Audit Results */}
              {auditResult && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Latest Security Audit</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className={`font-medium ${auditResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {auditResult.passed ? 'PASSED' : 'FAILED'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                      <p className="font-medium">{formatNumber(auditResult.score * 100, 1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Issues Found</p>
                      <p className="font-medium">{auditResult.issues.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last Audit</p>
                      <p className="font-medium">{auditResult.lastAudit.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {auditResult.issues.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Issues</h4>
                      <div className="space-y-2">
                        {auditResult.issues.slice(0, 5).map((issue, index) => (
                          <div key={index} className="text-sm border-l-4 border-red-400 pl-4 py-2 bg-red-50">
                            <p className="font-medium text-red-800">{issue.title}</p>
                            <p className="text-red-600">{issue.description}</p>
                            <p className="text-red-500 text-xs mt-1">Severity: {issue.severity}</p>
                          </div>
                        ))}
                        {auditResult.issues.length > 5 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ... and {auditResult.issues.length - 5} more issues
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Recent Security Events</h3>
              {recentEvents.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No recent security events</p>
              ) : (
                <div className="space-y-2">
                  {recentEvents.map((event, index) => (
                    <div key={index} className={`border rounded-lg p-3 ${getStatusColor(event.level).replace('text-', 'border-').replace('bg-', 'bg-opacity-20 bg-')}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(event.level)}`}>
                            {event.level.toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.type}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {event.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{event.message}</p>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">Metadata</summary>
                          <pre className="text-xs text-gray-600 dark:text-gray-400 mt-1 overflow-x-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Detailed Security Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metrics.map((metric, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{metric.name}</h4>
                    <p className="text-2xl font-bold mt-2 mb-2">{metric.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{metric.description}</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-2 ${getStatusColor(metric.status)}`}>
                      {getStatusIcon(metric.status)} {metric.status.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Security Configuration</h3>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Configuration Validation</h4>
                {(() => {
                  const validation = validateSecurityConfig();
                  return (
                    <>
                      <div className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium mb-4 ${getStatusColor(validation.isValid ? 'good' : 'error')}`}>
                        {getStatusIcon(validation.isValid ? 'good' : 'error')} 
                        {validation.isValid ? 'VALID' : 'ISSUES FOUND'}
                      </div>
                      
                      {validation.issues.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-red-800 mb-2">Issues</h5>
                          <ul className="space-y-1">
                            {validation.issues.map((issue, index) => (
                              <li key={index} className="text-sm text-red-600">• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {validation.recommendations.length > 0 && (
                        <div>
                          <h5 className="font-medium text-yellow-800 mb-2">Recommendations</h5>
                          <ul className="space-y-1">
                            {validation.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-yellow-600">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

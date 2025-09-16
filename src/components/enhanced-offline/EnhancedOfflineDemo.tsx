/**
 * Enhanced Offline Capabilities Demo Component
 * Demonstrates advanced PWA features for pain tracking
 */

import React, { useState, useEffect } from 'react';
import { advancedOfflineManager } from '../../lib/advanced-offline';

interface OfflineResource {
  id: string;
  title: string;
  type: string;
  priority: string;
  size: number;
}

interface HealthInsight {
  id: string;
  type: string;
  confidence: number;
  generatedAt: string;
  recommendations?: string[];
}

interface ConflictInfo {
  id: string;
  entityType: string;
  conflictFields: string[];
  detectedAt: string;
}

interface OfflineStatus {
  resourcesAvailable: number;
  insightsGenerated: number;
  unresolvedConflicts: number;
  storageUsed: string;
}

export const EnhancedOfflineDemo: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus | null>(null);
  const [resources, setResources] = useState<OfflineResource[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [copingStrategies, setCopingStrategies] = useState<OfflineResource[]>([]);
  const [painLevel, setPainLevel] = useState(5);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    // Set up connectivity listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up custom event listeners for offline capabilities
    const handleInsightsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      setInsights(customEvent.detail.insights);
    };

    const handleConflictDetected = (event: Event) => {
      const customEvent = event as CustomEvent;
      setConflicts(prev => [...prev, customEvent.detail]);
    };

    window.addEventListener('health-insights-updated', handleInsightsUpdate);
    window.addEventListener('data-conflict-detected', handleConflictDetected);

    // Initial load
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('health-insights-updated', handleInsightsUpdate);
      window.removeEventListener('data-conflict-detected', handleConflictDetected);
    };
  }, []);

  useEffect(() => {
    // Update coping strategies when pain level or location changes
    const updateCopingStrategies = async () => {
      try {
        const strategies = advancedOfflineManager.getOfflineCopingStrategies(
          painLevel, 
          selectedLocation || undefined
        );
        setCopingStrategies(strategies);
      } catch (error) {
        console.error('Failed to get coping strategies:', error);
      }
    };

    updateCopingStrategies();
  }, [painLevel, selectedLocation]);

  const loadOfflineData = async () => {
    try {
      // Get current status
      const status = advancedOfflineManager.getStatus();
      setOfflineStatus(status);

      // Get health insights
      const currentInsights = advancedOfflineManager.getHealthInsights();
      setInsights(currentInsights);

      // Get unresolved conflicts
      const unresolvedConflicts = advancedOfflineManager.conflictResolver.getUnresolvedConflicts();
      setConflicts(unresolvedConflicts);

      // Get available resources (simulate)
      setResources([
        { id: 'breathing-exercises', title: 'Breathing Exercises', type: 'exercise', priority: 'critical', size: 1024 },
        { id: 'emergency-contacts', title: 'Emergency Contacts', type: 'emergency-contact', priority: 'critical', size: 512 },
        { id: 'pain-management-basics', title: 'Pain Management Basics', type: 'coping-strategy', priority: 'high', size: 2048 },
        { id: 'medication-guide', title: 'Medication Guide', type: 'medication-guide', priority: 'medium', size: 4096 }
      ]);

    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const processInsights = async () => {
    try {
      await advancedOfflineManager.insightsProcessor.processNewInsights();
      const newInsights = advancedOfflineManager.getHealthInsights();
      setInsights(newInsights);
    } catch (error) {
      console.error('Failed to process insights:', error);
    }
  };

  const downloadEssentialResources = async () => {
    try {
      await advancedOfflineManager.resourceManager.downloadEssentialResources();
      const status = advancedOfflineManager.getStatus();
      setOfflineStatus(status);
    } catch (error) {
      console.error('Failed to download resources:', error);
    }
  };

  const resolveConflict = async (conflictId: string, strategy: 'client-wins' | 'server-wins' | 'merge') => {
    try {
      await advancedOfflineManager.conflictResolver.resolveConflict(conflictId, { type: strategy });
      const unresolvedConflicts = advancedOfflineManager.conflictResolver.getUnresolvedConflicts();
      setConflicts(unresolvedConflicts);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="enhanced-offline-demo p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Offline Capabilities</h1>
        <p className="text-gray-600">Advanced PWA features for pain tracking with sophisticated offline support</p>
      </div>

      {/* Connection Status */}
      <div className={`mb-6 p-4 rounded-lg ${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">
            {isOnline ? 'Online' : 'Offline'} - Enhanced capabilities active
          </span>
        </div>
      </div>

      {/* Offline Status Dashboard */}
      {offlineStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Resources Available</h3>
            <p className="text-2xl font-bold text-blue-600">{offlineStatus.resourcesAvailable}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Insights Generated</h3>
            <p className="text-2xl font-bold text-green-600">{offlineStatus.insightsGenerated}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Unresolved Conflicts</h3>
            <p className="text-2xl font-bold text-orange-600">{offlineStatus.unresolvedConflicts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
            <p className="text-2xl font-bold text-purple-600">{offlineStatus.storageUsed}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coping Strategies */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Offline Coping Strategies</h2>
          
          <div className="mb-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pain Level: {painLevel}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(Number(e.target.value))}
              className="w-full"
            />
            
            <label className="block text-sm font-medium text-gray-700">Location (optional)</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All locations</option>
              <option value="head">Head</option>
              <option value="neck">Neck</option>
              <option value="back">Back</option>
              <option value="joints">Joints</option>
            </select>
          </div>

          <div className="space-y-2">
            {copingStrategies.length > 0 ? (
              copingStrategies.map((strategy) => (
                <div key={strategy.id} className="p-3 border border-gray-200 rounded-md">
                  <h3 className="font-medium">{strategy.title}</h3>
                  <p className="text-sm text-gray-600">
                    Priority: <span className={getPriorityColor(strategy.priority)}>{strategy.priority}</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No offline coping strategies available for current criteria</p>
            )}
          </div>
        </div>

        {/* Health Insights */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Health Insights</h2>
            <button
              onClick={processInsights}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Process New
            </button>
          </div>

          <div className="space-y-3">
            {insights.length > 0 ? (
              insights.slice(-5).map((insight) => (
                <div key={insight.id} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium capitalize">{insight.type.replace('-', ' ')}</h3>
                    <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}% confident
                    </span>
                  </div>
                  
                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Recommendations:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {insight.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(insight.generatedAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No health insights available yet</p>
            )}
          </div>
        </div>

        {/* Available Resources */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Offline Resources</h2>
            <button
              onClick={downloadEssentialResources}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Download Essential
            </button>
          </div>

          <div className="space-y-2">
            {resources.map((resource) => (
              <div key={resource.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-md">
                <div>
                  <h3 className="font-medium">{resource.title}</h3>
                  <p className="text-sm text-gray-600">
                    Type: {resource.type} | Priority: <span className={getPriorityColor(resource.priority)}>{resource.priority}</span>
                  </p>
                </div>
                <span className="text-sm text-gray-500">{formatBytes(resource.size)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conflict Resolution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Data Conflicts</h2>

          {conflicts.length > 0 ? (
            <div className="space-y-3">
              {conflicts.map((conflict) => (
                <div key={conflict.id} className="p-3 border border-orange-200 bg-orange-50 rounded-md">
                  <h3 className="font-medium text-orange-800">
                    {conflict.entityType} Conflict
                  </h3>
                  <p className="text-sm text-orange-700 mb-2">
                    Fields: {conflict.conflictFields.join(', ')}
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => resolveConflict(conflict.id, 'client-wins')}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Keep Local
                    </button>
                    <button
                      onClick={() => resolveConflict(conflict.id, 'server-wins')}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Keep Remote
                    </button>
                    <button
                      onClick={() => resolveConflict(conflict.id, 'merge')}
                      className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Merge
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Detected: {new Date(conflict.detectedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600">No data conflicts detected</p>
          )}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Enhanced Offline Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              ⚡
            </div>
            <h3 className="font-medium">Advanced Conflict Resolution</h3>
            <p className="text-sm text-gray-600">Intelligent merge strategies for offline/online data conflicts</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              🔄
            </div>
            <h3 className="font-medium">Sophisticated Sync</h3>
            <p className="text-sm text-gray-600">Differential sync with intelligent prioritization</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              📚
            </div>
            <h3 className="font-medium">Offline Resources</h3>
            <p className="text-sm text-gray-600">Coping mechanisms and health resources available offline</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              🧠
            </div>
            <h3 className="font-medium">Background Insights</h3>
            <p className="text-sm text-gray-600">AI-powered health pattern analysis in the background</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOfflineDemo;

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format as formatDate } from 'date-fns';
import type { PainEntry } from '../../types';
import { analyzeTrends, calculateStatistics } from '../../utils/pain-tracker/trending';
import { exportToCSV, exportToJSON, downloadData } from '../../utils/pain-tracker/export';
import { ComparisonAnalytics, LocationHeatmap, TreatmentOverlay } from './analytics-v2';
import { VisitSummary, ClinicalExports } from './clinician-export';
import { AccessibilityControls, LanguageSelector } from '../accessibility';
import { EncryptedBackup, DataRestore } from '../data-resilience';
import { TemplateLibrary } from '../templates';

interface PainAnalyticsProps {
  entries: PainEntry[];
  onDataRestore?: (entries: PainEntry[]) => void;
  onApplyTemplate?: (template: Partial<PainEntry>) => void;
}

type TabId = 'overview' | 'comparison' | 'heatmap' | 'treatment' | 'clinical' | 'accessibility' | 'backup' | 'templates';

export const PainAnalytics: React.FC<PainAnalyticsProps> = ({ 
  entries, 
  onDataRestore = () => {}, 
  onApplyTemplate = () => {} 
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const trends = analyzeTrends(entries);
  const stats = calculateStatistics(entries);

  const tabs: Array<{ id: TabId; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'comparison', label: 'Comparisons', icon: '📈' },
    { id: 'heatmap', label: 'Body Heatmap', icon: '🗺️' },
    { id: 'treatment', label: 'Treatment Timeline', icon: '💊' },
    { id: 'clinical', label: 'Clinical Export', icon: '🏥' },
    { id: 'backup', label: 'Data Backup', icon: '💾' },
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' }
  ];

  const timeOfDayData = Object.entries(trends.timeOfDayPattern).map(([hour, pain]) => ({
    hour,
    avgPain: pain / entries.filter(e => formatDate(new Date(e.timestamp), 'HH:00') === hour).length
  }));

  const locationData = Object.entries(trends.locationFrequency).map(([location, frequency]) => ({
    location,
    frequency,
    avgPain: stats.locationStats[location]?.avgPain || 0
  }));

  const symptomData = Object.entries(trends.symptomCorrelations).map(([symptom]) => ({
    symptom,
    frequency: stats.symptomStats[symptom]?.frequency || 0,
    avgPain: stats.symptomStats[symptom]?.avgPain || 0
  }));

  const handleExport = (format: 'csv' | 'json') => {
    const timestamp = formatDate(new Date(), 'yyyy-MM-dd');
    if (format === 'csv') {
      const csvData = exportToCSV(entries);
      downloadData(csvData, `pain-tracker-export-${timestamp}.csv`);
    } else {
      const jsonData = exportToJSON(entries);
      downloadData(jsonData, `pain-tracker-export-${timestamp}.json`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Analytics Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8 p-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Pain Overview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Export JSON
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-card">
                <h3 className="text-gray-600">Average Pain</h3>
                <p className="text-2xl font-bold">{stats.mean.toFixed(1)}</p>
              </div>
              <div className="stat-card">
                <h3 className="text-gray-600">Most Common Level</h3>
                <p className="text-2xl font-bold">{stats.mode}</p>
              </div>
              <div className="stat-card">
                <h3 className="text-gray-600">Pain Trend</h3>
                <p className="text-2xl font-bold">
                  {trends.painTrends.increasing ? '↑' : '↓'} {Math.abs(trends.painTrends.averageChange).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pain by Time of Day</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeOfDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgPain"
                    stroke="#8884d8"
                    name="Average Pain Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Pain by Location</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="frequency" fill="#8884d8" name="Frequency" />
                    <Bar dataKey="avgPain" fill="#82ca9d" name="Avg Pain" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Symptoms Analysis</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="symptom" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="frequency" fill="#8884d8" name="Frequency" />
                    <Bar dataKey="avgPain" fill="#82ca9d" name="Avg Pain" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && <ComparisonAnalytics entries={entries} />}
      {activeTab === 'heatmap' && <LocationHeatmap entries={entries} />}
      {activeTab === 'treatment' && <TreatmentOverlay entries={entries} />}
      {activeTab === 'clinical' && (
        <div className="space-y-6">
          <VisitSummary entries={entries} />
          <ClinicalExports entries={entries} />
        </div>
      )}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <EncryptedBackup entries={entries} />
          <DataRestore onDataRestore={onDataRestore} />
        </div>
      )}
      {activeTab === 'templates' && (
        <TemplateLibrary onApplyTemplate={onApplyTemplate} />
      )}
      {activeTab === 'accessibility' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AccessibilityControls />
            <LanguageSelector />
          </div>
        </div>
      )}
    </div>
  );
};
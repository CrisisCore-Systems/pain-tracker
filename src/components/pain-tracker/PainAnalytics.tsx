import React from 'react';
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

interface PainAnalyticsProps {
  entries: PainEntry[];
}

export const PainAnalytics: React.FC<PainAnalyticsProps> = ({ entries }) => {
  const trends = analyzeTrends(entries);
  const stats = calculateStatistics(entries);

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

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Tracking Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <h3 className="text-gray-600">Total Entries</h3>
            <p className="text-2xl font-bold">{stats.timeRangeStats.totalEntries}</p>
          </div>
          <div className="stat-card">
            <h3 className="text-gray-600">Tracking Since</h3>
            <p className="text-lg">
              {stats.timeRangeStats.start ? formatDate(new Date(stats.timeRangeStats.start), 'MMM d, yyyy') : 'N/A'}
            </p>
          </div>
          <div className="stat-card">
            <h3 className="text-gray-600">Tracking Duration</h3>
            <p className="text-lg">
              {stats.timeRangeStats.duration ? `${Math.floor(stats.timeRangeStats.duration / (1000 * 60 * 60 * 24))} days` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
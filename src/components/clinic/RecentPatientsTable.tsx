/**
 * Recent Patients Table - Clinical table showing recent patient activity
 */

import { useState } from 'react';
import { Eye, FileText, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Patient {
  id: string;
  name: string;
  lastVisit: string;
  painTrend: 'improving' | 'stable' | 'worsening';
  avgPainLevel: number;
  totalEntries: number;
  nextAppointment?: string;
}

export function RecentPatientsTable() {
  // Mock data - in production, fetch from API
  const [patients] = useState<Patient[]>([
    {
      id: 'P001',
      name: 'John Smith',
      lastVisit: '2025-11-15',
      painTrend: 'improving',
      avgPainLevel: 4.2,
      totalEntries: 45,
      nextAppointment: '2025-11-20'
    },
    {
      id: 'P002',
      name: 'Maria Garcia',
      lastVisit: '2025-11-16',
      painTrend: 'worsening',
      avgPainLevel: 7.8,
      totalEntries: 62,
      nextAppointment: '2025-11-18'
    },
    {
      id: 'P003',
      name: 'James Wilson',
      lastVisit: '2025-11-17',
      painTrend: 'stable',
      avgPainLevel: 5.5,
      totalEntries: 38
    },
    {
      id: 'P004',
      name: 'Sarah Chen',
      lastVisit: '2025-11-14',
      painTrend: 'improving',
      avgPainLevel: 3.1,
      totalEntries: 89,
      nextAppointment: '2025-11-22'
    },
    {
      id: 'P005',
      name: 'Michael Brown',
      lastVisit: '2025-11-17',
      painTrend: 'worsening',
      avgPainLevel: 8.2,
      totalEntries: 27
    }
  ]);

  const getTrendIcon = (trend: Patient['painTrend']) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'worsening':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-amber-500" />;
    }
  };

  const getPainLevelColor = (level: number) => {
    if (level < 4) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (level < 7) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Recent Patient Activity
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Patients with recent pain entries
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Patient
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Last Visit
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Pain Trend
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Avg Pain
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Entries
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Next Appt
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {patients.map((patient) => (
              <tr 
                key={patient.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {patient.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      ID: {patient.id}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {new Date(patient.lastVisit).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(patient.painTrend)}
                    <span className="text-sm capitalize text-slate-700 dark:text-slate-300">
                      {patient.painTrend}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPainLevelColor(patient.avgPainLevel)}`}>
                    {patient.avgPainLevel.toFixed(1)} / 10
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {patient.totalEntries}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {patient.nextAppointment 
                    ? new Date(patient.nextAppointment).toLocaleDateString()
                    : '—'
                  }
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/clinic/patients/${patient.id}`}
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="View patient details"
                    >
                      <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </Link>
                    <button
                      className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      title="View reports"
                    >
                      <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      title="Schedule appointment"
                    >
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <Link
          to="/clinic/patients"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View all patients →
        </Link>
      </div>
    </div>
  );
}

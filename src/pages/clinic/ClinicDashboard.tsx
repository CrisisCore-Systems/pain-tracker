/**
 * Clinic Dashboard - Main overview for healthcare professionals
 */

import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  FileText,
  Activity,
  Brain,
  Bell,
  Download
} from 'lucide-react';
import { ClinicStatCard } from '../../components/clinic/ClinicStatCard';
import { RecentPatientsTable } from '../../components/clinic/RecentPatientsTable';
import { UpcomingAppointments } from '../../components/clinic/UpcomingAppointments';
import { PriorityAlerts } from '../../components/clinic/PriorityAlerts';

export function ClinicDashboard() {
  const navigate = useNavigate();
  
  // Mock data - in production, fetch from API
  const stats = {
    activePatients: 247,
    todaysAppointments: 12,
    pendingReports: 8,
    criticalAlerts: 3,
    appointmentsChange: '+12%',
    patientsChange: '+8%',
    reportsChange: '-15%',
    alertsChange: '+2',
    aiPatternsDetected: 12,
    medicationAdherence: 87
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Clinical Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Welcome back! Here's an overview of your patients and activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClinicStatCard
          title="Active Patients"
          value={stats.activePatients}
          change={stats.patientsChange}
          icon={Users}
          trend="up"
          iconColor="bg-blue-500"
        />
        <ClinicStatCard
          title="Today's Appointments"
          value={stats.todaysAppointments}
          change={stats.appointmentsChange}
          icon={Calendar}
          trend="up"
          iconColor="bg-green-500"
        />
        <ClinicStatCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          change={stats.alertsChange}
          icon={AlertTriangle}
          trend="up"
          iconColor="bg-red-500"
        />
        <ClinicStatCard
          title="AI Insights"
          value={stats.aiPatternsDetected}
          change={`${stats.medicationAdherence}% adherence`}
          icon={Brain}
          trend="up"
          iconColor="bg-purple-500"
        />
      </div>

      {/* Feature Highlights - New Enhanced Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/clinic/monitoring')}
          className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30 rounded-lg border-2 border-red-200 dark:border-red-800 transition-all text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <Bell className="w-8 h-8 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
              {stats.criticalAlerts} Active
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Real-Time Monitoring
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Live patient alerts for pain escalation, missed medications, and crisis detection
          </p>
          <div className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400 font-medium text-sm">
            View Dashboard →
          </div>
        </button>

        <button
          onClick={() => navigate('/clinic/patients/1')}
          className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 rounded-lg border-2 border-purple-200 dark:border-purple-800 transition-all text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
              {stats.aiPatternsDetected} Insights
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            AI Pattern Detection
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Automatic identification of pain triggers, medication efficacy, and treatment correlations
          </p>
          <div className="mt-4 flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-sm">
            See Patient Example →
          </div>
        </button>

        <button
          onClick={() => navigate('/clinic/patients/1')}
          className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 rounded-lg border-2 border-blue-200 dark:border-blue-800 transition-all text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <Download className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              1-Click
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Automated Reports
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Generate WorkSafe BC and insurance reports in seconds with pre-filled data
          </p>
          <div className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm">
            Try Report Generator →
          </div>
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Takes 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Alerts */}
          <PriorityAlerts />

          {/* Recent Patients */}
          <RecentPatientsTable />
        </div>

        {/* Right Column - Takes 1/3 width */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <UpcomingAppointments />

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/clinic/patients')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left"
              >
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  View All Patients
                </span>
              </button>
              <button 
                onClick={() => navigate('/clinic/monitoring')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-left"
              >
                <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-900 dark:text-red-100">
                  Check Alerts
                </span>
              </button>
              <button 
                onClick={() => navigate('/clinic/patients/1')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-left"
              >
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  View AI Insights
                </span>
              </button>
              <button 
                onClick={() => navigate('/clinic/patients/1')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Generate Report
                </span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">API Status</span>
                </div>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Last Sync</span>
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">2 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

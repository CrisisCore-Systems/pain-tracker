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
  Download,
  Sparkles,
  ArrowRight
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
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Page Header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-500/30">
            <Activity className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Clinical Dashboard
            </h1>
            <p className="text-slate-400">
              Welcome back! Here's an overview of your patients and activities.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClinicStatCard
          title="Active Patients"
          value={stats.activePatients}
          change={stats.patientsChange}
          icon={Users}
          trend="up"
          iconColor="bg-sky-500"
        />
        <ClinicStatCard
          title="Today's Appointments"
          value={stats.todaysAppointments}
          change={stats.appointmentsChange}
          icon={Calendar}
          trend="up"
          iconColor="bg-emerald-500"
        />
        <ClinicStatCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          change={stats.alertsChange}
          icon={AlertTriangle}
          trend="up"
          iconColor="bg-rose-500"
        />
        <ClinicStatCard
          title="AI Insights"
          value={stats.aiPatternsDetected}
          change={`${stats.medicationAdherence}% adherence`}
          icon={Brain}
          trend="up"
          iconColor="bg-violet-500"
        />
      </div>

      {/* Feature Highlights - Premium Cards */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/clinic/monitoring')}
          className="group p-6 rounded-2xl border border-rose-500/20 transition-all text-left hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(190, 18, 60, 0.1) 100%)',
            boxShadow: '0 15px 40px -10px rgba(244, 63, 94, 0.2)'
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30">
              <Bell className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white">
              {stats.criticalAlerts} Active
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Real-Time Monitoring
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Live patient alerts for pain escalation, missed medications, and crisis detection
          </p>
          <div className="flex items-center gap-2 text-rose-400 font-medium text-sm group-hover:gap-3 transition-all">
            View Dashboard <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        <button
          onClick={() => navigate('/clinic/patients/1')}
          className="group p-6 rounded-2xl border border-violet-500/20 transition-all text-left hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(109, 40, 217, 0.1) 100%)',
            boxShadow: '0 15px 40px -10px rgba(139, 92, 246, 0.2)'
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
              <Brain className="w-6 h-6 text-violet-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500 text-white">
              {stats.aiPatternsDetected} Insights
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            AI Pattern Detection
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Automatic identification of pain triggers, medication efficacy, and treatment correlations
          </p>
          <div className="flex items-center gap-2 text-violet-400 font-medium text-sm group-hover:gap-3 transition-all">
            See Patient Example <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        <button
          onClick={() => navigate('/clinic/patients/1')}
          className="group p-6 rounded-2xl border border-sky-500/20 transition-all text-left hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(2, 132, 199, 0.1) 100%)',
            boxShadow: '0 15px 40px -10px rgba(14, 165, 233, 0.2)'
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/30">
              <Download className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500 text-white">
              1-Click
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Automated Reports
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Generate WorkSafe BC and insurance reports in seconds with pre-filled data
          </p>
          <div className="flex items-center gap-2 text-sky-400 font-medium text-sm group-hover:gap-3 transition-all">
            Try Report Generator <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <div 
            className="rounded-2xl border border-slate-700/50 p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/clinic/patients')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-colors text-left group"
              >
                <Users className="w-5 h-5 text-sky-400" />
                <span className="text-sm font-medium text-sky-300 group-hover:text-sky-200">
                  View All Patients
                </span>
              </button>
              <button 
                onClick={() => navigate('/clinic/monitoring')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors text-left group"
              >
                <Bell className="w-5 h-5 text-rose-400" />
                <span className="text-sm font-medium text-rose-300 group-hover:text-rose-200">
                  Check Alerts
                </span>
              </button>
              <button 
                onClick={() => navigate('/clinic/patients/1')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-colors text-left group"
              >
                <Brain className="w-5 h-5 text-violet-400" />
                <span className="text-sm font-medium text-violet-300 group-hover:text-violet-200">
                  View AI Insights
                </span>
              </button>
              <button 
                onClick={() => navigate('/clinic/patients/1')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-left group"
              >
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300 group-hover:text-emerald-200">
                  Generate Report
                </span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div 
            className="rounded-2xl border border-slate-700/50 p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-slate-400">API Status</span>
                </div>
                <span className="text-sm font-medium text-emerald-400">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span className="text-sm text-slate-400">Last Sync</span>
                </div>
                <span className="text-sm font-medium text-slate-300">2 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
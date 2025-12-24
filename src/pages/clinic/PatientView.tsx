/**
 * Patient View - Detailed patient information and pain tracking history
 */

import { useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Calendar,
  TrendingDown,
  FileText,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChartDataPoint } from '../../components/accessibility/ChartWithTableToggle';
import { ChartWithTableToggle } from '../../components/accessibility/ChartWithTableToggle';

export function PatientView() {
  const { patientId } = useParams();

  // Mock patient data
  const patient = {
    id: patientId || 'P001',
    name: 'John Smith',
    dateOfBirth: '1975-03-15',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    lastVisit: '2025-11-15',
    nextAppointment: '2025-11-20',
    painTrend: 'improving',
    avgPainLevel: 4.2,
    totalEntries: 45
  };

  // Mock pain history series (30 days), derived from the summary values above.
  // Clinic module is currently mocked; this provides a real chart instead of a placeholder.
  const painHistory = (() => {
    const days = 30;
    const base = patient.avgPainLevel;

    // Gentle deterministic variance for a believable series.
    const variance = (i: number) => {
      const wave = Math.sin(i / 3) * 0.6 + Math.cos(i / 5) * 0.4;
      const trend = patient.painTrend === 'improving' ? (days - 1 - i) * 0.03 : i * 0.03;
      return wave + trend;
    };

    const clamp = (v: number) => Math.max(0, Math.min(10, v));
    const out: Array<{ date: Date; pain: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      out.push({
        date,
        pain: Math.round(clamp(base + variance(days - 1 - i)) * 10) / 10,
      });
    }
    return out;
  })();

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Link
        to="/clinic/patients"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Patients</span>
      </Link>

      {/* Patient Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {patient.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Patient ID: {patient.id}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Schedule</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Patient Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Date of Birth</p>
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-1">
              {new Date(patient.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-1">
              {patient.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-1">
              {patient.phone}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Next Appointment</p>
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-1">
              {new Date(patient.nextAppointment).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pain Trend</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 capitalize">
                {patient.painTrend}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Pain Level</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {patient.avgPainLevel} / 10
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Entries</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {patient.totalEntries}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pain History */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Pain History
        </h2>
        <ChartWithTableToggle
          title="Pain history (last 30 days)"
          description="Daily pain scores for the selected patient."
          type="line"
          icon={Activity}
          height={256}
          className="border-none shadow-none p-0 bg-transparent"
          chartData={{
            labels: painHistory.map(p =>
              p.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            ),
            datasets: [
              {
                label: 'Pain (0-10)',
                data: painHistory.map(p => p.pain),
              },
            ],
          }}
          tableData={(painHistory.map(p => ({
            label: p.date.toLocaleDateString(),
            value: p.pain,
          })) satisfies ChartDataPoint[])}
        />
      </div>

      {/* Clinical Notes */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Clinical Notes
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Follow-up Visit
              </p>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                2025-11-15
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Patient reports significant improvement with current treatment plan. 
              Pain levels have decreased from average 6.5 to 4.2 over the past month.
              Continue current medications and schedule follow-up in 2 weeks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

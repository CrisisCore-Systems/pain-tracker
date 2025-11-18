/**
 * Upcoming Appointments - Shows scheduled appointments for clinicians
 */

import { Calendar, Clock, User } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  time: string;
  duration: number;
  type: 'follow-up' | 'initial' | 'urgent';
  reason: string;
}

export function UpcomingAppointments() {
  // Mock data - in production, fetch from API
  const appointments: Appointment[] = [
    {
      id: 'A001',
      patientName: 'John Smith',
      patientId: 'P001',
      time: '09:00 AM',
      duration: 30,
      type: 'follow-up',
      reason: 'Pain reassessment'
    },
    {
      id: 'A002',
      patientName: 'Maria Garcia',
      patientId: 'P002',
      time: '10:30 AM',
      duration: 45,
      type: 'urgent',
      reason: 'Pain escalation'
    },
    {
      id: 'A003',
      patientName: 'James Wilson',
      patientId: 'P003',
      time: '02:00 PM',
      duration: 30,
      type: 'follow-up',
      reason: 'Treatment review'
    },
    {
      id: 'A004',
      patientName: 'Emily Rodriguez',
      patientId: 'P006',
      time: '03:15 PM',
      duration: 60,
      type: 'initial',
      reason: 'Initial consultation'
    }
  ];

  const getTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'initial':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Today's Schedule
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {appointments.length} appointments
            </p>
          </div>
          <Calendar className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {apt.patientName}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(apt.type)}`}>
                  {apt.type}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{apt.time}</span>
                </div>
                <span>•</span>
                <span>{apt.duration} min</span>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300">
                {apt.reason}
              </p>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
          View Full Schedule
        </button>
      </div>
    </div>
  );
}

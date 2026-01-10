import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Search, 
  Plus, 
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Badge } from '../../design-system/components/Badge';
import type { Appointment } from '../../types/clinic';
import { cn } from '../../design-system/utils';

export function ClinicAppointments() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<string>('all');
  
  // Mock data extended from the dashboard widget
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'A001',
      patientName: 'John Smith',
      patientId: 'P001',
      time: '09:00 AM',
      date: '2025-11-20',
      duration: 30,
      type: 'follow-up',
      status: 'scheduled',
      reason: 'Pain reassessment',
      location: 'in-person'
    },
    {
      id: 'A002',
      patientName: 'Maria Garcia',
      patientId: 'P002',
      time: '10:30 AM',
      date: '2025-11-20',
      duration: 45,
      type: 'urgent',
      status: 'checked-in',
      reason: 'Pain escalation',
      location: 'in-person'
    },
    {
      id: 'A003',
      patientName: 'James Wilson',
      patientId: 'P003',
      time: '02:00 PM',
      date: '2025-11-20',
      duration: 30,
      type: 'follow-up',
      status: 'scheduled',
      reason: 'Treatment review',
      location: 'telehealth'
    },
    {
      id: 'A004',
      patientName: 'Emily Rodriguez',
      patientId: 'P006',
      time: '03:15 PM',
      date: '2025-11-20',
      duration: 60,
      type: 'initial',
      status: 'scheduled',
      reason: 'New referral intake',
      location: 'in-person'
    },
    {
      id: 'A005',
      patientName: 'Robert Chen',
      patientId: 'P008',
      time: '04:30 PM',
      date: '2025-11-20',
      duration: 30,
      type: 'check-in',
      status: 'cancelled',
      reason: 'Medication refill request',
      notes: 'Patient called to cancel, rescheduled for next week',
      location: 'telehealth'
    }
  ]);

  const filteredAppointments = appointments.filter(apt => {
    if (filterType === 'all') return true;
    return apt.status === filterType;
  });

  const getTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'initial':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'check-in':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };
  
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200';
      case 'completed':
        return 'bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400';
      case 'cancelled':
      case 'no-show':
        return 'bg-red-50 text-red-500 dark:bg-red-900/10 dark:text-red-400';
      default:
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Appointments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage schedule and patient visits
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Nov 20, 2025
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                <Plus className="h-4 w-4" />
                New Appointment
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Quick Stats */}
        <Card className="md:col-span-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Today</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12</div>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">Checked In</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4</div>
                    </div>
                     <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                        <div className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">8</div>
                    </div>
                     <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                        <div className="text-sm font-medium text-red-600 dark:text-red-400">Urgent</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">1</div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Filters & List */}
        <Card className="md:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search patients..." 
                            className="pl-9 w-[250px]"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button 
                            onClick={() => setFilterType('all')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                filterType === 'all' 
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                            )}
                        >
                            All
                        </button>
                         <button 
                            onClick={() => setFilterType('scheduled')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                filterType === 'scheduled' 
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                            )}
                        >
                            Scheduled
                        </button>
                         <button 
                            onClick={() => setFilterType('checked-in')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                filterType === 'checked-in' 
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                            )}
                        >
                            Checked In
                        </button>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {filteredAppointments.map((apt) => (
                        <div 
                            key={apt.id} 
                            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="min-w-[5rem] text-center">
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">
                                        {apt.time}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">
                                        {apt.duration} min
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {apt.patientName}
                                        </span>
                                        <span className="text-xs text-slate-400">#{apt.patientId}</span>
                                        <Badge variant="outline" className={cn("text-xs capitalize ml-2", getTypeColor(apt.type))}>
                                            {apt.type}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                        <span className="font-medium">{apt.reason}</span>
                                        {apt.location === 'telehealth' && (
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Telehealth</Badge>
                                        )}
                                    </div>
                                    {apt.notes && (
                                        <div className="text-xs text-amber-600 dark:text-amber-500 mt-1 italic">
                                            "{apt.notes}"
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Badge 
                                    variant="outline" 
                                    className={cn("capitalize", getStatusColor(apt.status))}
                                >
                                    {apt.status}
                                </Badge>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    {apt.status === 'scheduled' && (
                                        <Button size="sm" variant="outline" className="h-8 gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Check In
                                        </Button>
                                    )}
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {filteredAppointments.length === 0 && (
                         <div className="p-12 text-center text-slate-500">
                            No appointments found for current filter.
                         </div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

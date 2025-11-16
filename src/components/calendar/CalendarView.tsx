import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Activity,
  Zap,
  MapPin,
  Pill,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { cn } from '../../design-system/utils';
import { Button, Badge } from '../../design-system';
import type { PainEntry } from '../../types';

interface CalendarViewProps {
  entries: PainEntry[];
}

interface DayData {
  date: Date;
  entries: PainEntry[];
  avgPain: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function CalendarView({ entries }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // Calendar calculations
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and last day
    const firstDay = new Date(year, month, 1);
    
    // Get starting point (previous month days to fill the week)
    const startingDayOfWeek = firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startingDayOfWeek);
    
    // Generate 42 days (6 weeks)
    const days: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Find entries for this day
      const dayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return (
          entryDate.getFullYear() === date.getFullYear() &&
          entryDate.getMonth() === date.getMonth() &&
          entryDate.getDate() === date.getDate()
        );
      });
      
      const avgPain = dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / dayEntries.length
        : 0;
      
      days.push({
        date,
        entries: dayEntries,
        avgPain,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime()
      });
    }
    
    return days;
  }, [currentDate, entries]);

  // Month stats
  const monthStats = useMemo(() => {
    const monthEntries = calendarData
      .filter(day => day.isCurrentMonth && day.entries.length > 0)
      .flatMap(day => day.entries);
    
    if (monthEntries.length === 0) {
      return {
        avgPain: 0,
        totalEntries: 0,
        daysTracked: 0,
        bestDay: null,
        worstDay: null
      };
    }
    
    const avgPain = monthEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / monthEntries.length;
    const daysTracked = calendarData.filter(day => day.isCurrentMonth && day.entries.length > 0).length;
    
    const sortedDays = [...calendarData]
      .filter(day => day.isCurrentMonth && day.entries.length > 0)
      .sort((a, b) => a.avgPain - b.avgPain);
    
    return {
      avgPain,
      totalEntries: monthEntries.length,
      daysTracked,
      bestDay: sortedDays[0],
      worstDay: sortedDays[sortedDays.length - 1]
    };
  }, [calendarData]);

  const getPainColor = (pain: number) => {
    if (pain === 0) return 'bg-gray-100 dark:bg-gray-800 text-gray-400';
    if (pain <= 3) return 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
    if (pain <= 5) return 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
    if (pain <= 7) return 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700';
    return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
  };

  const getPainIntensity = (pain: number) => {
    if (pain === 0) return 'opacity-20';
    if (pain <= 3) return 'opacity-40';
    if (pain <= 5) return 'opacity-60';
    if (pain <= 7) return 'opacity-80';
    return 'opacity-100';
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Calendar View</h2>
          <p className="text-gray-600 dark:text-gray-400">Visual timeline of your pain tracking journey</p>
        </div>
        <Button variant="outline" onClick={goToToday} className="rounded-xl">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Today
        </Button>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-6 w-6 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{monthStats.avgPain.toFixed(1)}</div>
          <div className="text-sm opacity-90">Avg Pain This Month</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-6 w-6 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{monthStats.daysTracked}</div>
          <div className="text-sm opacity-90">Days Tracked</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="h-6 w-6 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {monthStats.bestDay ? monthStats.bestDay.avgPain.toFixed(1) : '-'}
          </div>
          <div className="text-sm opacity-90">Best Day</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-6 w-6 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {monthStats.worstDay ? monthStats.worstDay.avgPain.toFixed(1) : '-'}
          </div>
          <div className="text-sm opacity-90">Challenging Day</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{monthName}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevMonth}
                  className="rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextMonth}
                  className="rounded-xl"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarData.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(day.entries.length > 0 ? day : null)}
                  disabled={day.entries.length === 0}
                  className={cn(
                    'relative aspect-square rounded-xl p-2 transition-all duration-200',
                    'flex flex-col items-center justify-center',
                    day.entries.length > 0 && 'cursor-pointer hover:scale-105 border-2',
                    day.entries.length === 0 && 'cursor-default',
                    !day.isCurrentMonth && 'opacity-30',
                    day.isToday && 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900',
                    day.entries.length > 0 ? getPainColor(day.avgPain) : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400',
                    selectedDay?.date.getTime() === day.date.getTime() && 'ring-2 ring-offset-2 dark:ring-offset-gray-900'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium mb-1',
                    day.isToday && 'font-bold'
                  )}>
                    {day.date.getDate()}
                  </span>
                  
                  {day.entries.length > 0 && (
                    <>
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        getPainColor(day.avgPain).split(' ')[0].replace('bg-', 'bg-'),
                        getPainIntensity(day.avgPain)
                      )} />
                      {day.entries.length > 1 && (
                        <span className="text-xs opacity-60 mt-0.5">
                          {day.entries.length}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Pain Level:</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-500" />
                    <span className="text-gray-600 dark:text-gray-400">Mild</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-orange-500" />
                    <span className="text-gray-600 dark:text-gray-400">Moderate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-500" />
                    <span className="text-gray-600 dark:text-gray-400">Severe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Day Details Panel */}
        <div className="lg:col-span-1">
          {selectedDay ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedDay.date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </h3>
                <Badge variant="outline" className="rounded-full">
                  {selectedDay.entries.length} {selectedDay.entries.length === 1 ? 'entry' : 'entries'}
                </Badge>
              </div>

              {/* Average Pain */}
              <div className={cn(
                'rounded-xl p-4 mb-4',
                getPainColor(selectedDay.avgPain)
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium opacity-80">Average Pain</span>
                  <div className="text-2xl font-bold">{selectedDay.avgPain.toFixed(1)}/10</div>
                </div>
              </div>

              {/* Entries List */}
              <div className="space-y-3">
                {selectedDay.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <Badge className={cn('rounded-full', getPainColor(entry.baselineData.pain))}>
                        {entry.baselineData.pain}/10
                      </Badge>
                    </div>

                    {entry.baselineData.locations && entry.baselineData.locations.length > 0 && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {entry.baselineData.locations.map((loc, i) => (
                            <Badge key={i} variant="outline" className="text-xs rounded-full">
                              {loc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.medications?.current && entry.medications.current.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Pill className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {entry.medications.current.map((med, i) => (
                            <Badge key={i} variant="outline" className="text-xs rounded-full">
                              {med.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/20 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
              <Info className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select a Day
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click on any day with entries to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;

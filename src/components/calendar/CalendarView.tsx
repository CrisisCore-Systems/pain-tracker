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
  Info,
  Cloud,
  Moon,
  Smile,
} from 'lucide-react';
import { cn } from '../../design-system/utils';
import { Button, Badge } from '../../design-system';
import type { PainEntry } from '../../types';
import { ExtendedEntryDetails } from '../pain-tracker/EntryDetailsSections';

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

      const avgPain =
        dayEntries.length > 0
          ? dayEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / dayEntries.length
          : 0;

      days.push({
        date,
        entries: dayEntries,
        avgPain,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
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
        worstDay: null,
      };
    }

    const avgPain =
      monthEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / monthEntries.length;
    const daysTracked = calendarData.filter(
      day => day.isCurrentMonth && day.entries.length > 0
    ).length;

    const sortedDays = [...calendarData]
      .filter(day => day.isCurrentMonth && day.entries.length > 0)
      .sort((a, b) => a.avgPain - b.avgPain);

    return {
      avgPain,
      totalEntries: monthEntries.length,
      daysTracked,
      bestDay: sortedDays[0],
      worstDay: sortedDays[sortedDays.length - 1],
    };
  }, [calendarData]);

  const getPainColor = (pain: number) => {
    if (pain === 0) return 'bg-muted/50 text-muted-foreground';
    if (pain <= 3)
      return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
    if (pain <= 5)
      return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700';
    if (pain <= 7)
      return 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700';
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
      <div className="relative rounded-2xl border border-border/60 bg-gradient-to-b from-primary/[0.04] to-transparent p-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Calendar View</h2>
              <p className="text-sm text-muted-foreground">
                Visual timeline of your pain tracking journey
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={goToToday} className="rounded-xl">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card/50 p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Pain</span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-foreground">{monthStats.avgPain.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground mt-1">This month</div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/50 p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20">
              <Zap className="h-4 w-4 text-purple-500" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Days Tracked</span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-foreground">{monthStats.daysTracked}</div>
          <div className="text-xs text-muted-foreground mt-1">This month</div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/50 p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Best Day</span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-foreground">
            {monthStats.bestDay ? monthStats.bestDay.avgPain.toFixed(1) : '-'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Lowest average</div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/50 p-5 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20">
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Challenging Day</span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-foreground">
            {monthStats.worstDay ? monthStats.worstDay.avgPain.toFixed(1) : '-'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Highest average</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">{monthName}</h3>
              <div className="inline-flex items-center gap-1 rounded-xl bg-muted/50 p-1">
                <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground py-2"
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
                    day.isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                    day.entries.length > 0
                      ? getPainColor(day.avgPain)
                      : 'bg-muted/30 text-muted-foreground',
                    selectedDay?.date.getTime() === day.date.getTime() &&
                      'ring-2 ring-primary/60 ring-offset-2 ring-offset-background'
                  )}
                >
                  <span className={cn('text-sm font-medium mb-1', day.isToday && 'font-bold')}>
                    {day.date.getDate()}
                  </span>

                  {day.entries.length > 0 && (
                    <>
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          getPainColor(day.avgPain).split(' ')[0].replace('bg-', 'bg-'),
                          getPainIntensity(day.avgPain)
                        )}
                      />
                      {day.entries.length > 1 && (
                        <span className="text-xs opacity-60 mt-0.5">{day.entries.length}</span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-border/60">
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground font-medium shrink-0">Numbers:</span>
                  <div className="text-muted-foreground">
                    <span className="font-medium text-foreground/80">Top</span>: day of month •{' '}
                    <span className="font-medium text-foreground/80">Small number</span>: entries logged (shown only when 2+)
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground font-medium shrink-0">Markers:</span>
                  <div className="text-muted-foreground">
                    <span className="font-medium text-foreground/80">Dot</span>: at least one entry •{' '}
                    <span className="font-medium text-foreground/80">Cell color</span>: average pain for that day
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Pain Level:</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-md bg-emerald-500" />
                      <span className="text-muted-foreground">Low</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-md bg-amber-500" />
                      <span className="text-muted-foreground">Mild</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-md bg-orange-500" />
                      <span className="text-muted-foreground">Moderate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-md bg-red-500" />
                      <span className="text-muted-foreground">Severe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Day Details Panel */}
        <div className="lg:col-span-1">
          {selectedDay ? (
            <div className="rounded-2xl border border-border/60 bg-card/50 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {selectedDay.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <Badge variant="outline" className="rounded-full">
                  {selectedDay.entries.length}{' '}
                  {selectedDay.entries.length === 1 ? 'entry' : 'entries'}
                </Badge>
              </div>

              {/* Average Pain */}
              <div className={cn('rounded-xl p-4 mb-4', getPainColor(selectedDay.avgPain))}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium opacity-80">Average Pain</span>
                  <div className="text-2xl font-bold">{selectedDay.avgPain.toFixed(1)}/10</div>
                </div>
              </div>

              {/* Entries List */}
              <div className="space-y-3">
                {selectedDay.entries.map(entry => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-border/40 bg-muted/30 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <Badge className={cn('rounded-full', getPainColor(entry.baselineData.pain))}>
                        {entry.baselineData.pain}/10
                      </Badge>
                    </div>

                    {entry.baselineData.locations && entry.baselineData.locations.length > 0 && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {entry.baselineData.locations.map((loc, i) => (
                            <Badge key={i} variant="outline" className="text-xs rounded-full">
                              {loc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.baselineData.symptoms && entry.baselineData.symptoms.length > 0 && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-400 dark:text-amber-500 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {entry.baselineData.symptoms.map((symptom, i) => (
                            <Badge key={i} variant="outline" className="text-xs rounded-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.medications?.current && entry.medications.current.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Pill className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {entry.medications.current.map((med, i) => (
                            <Badge key={i} variant="outline" className="text-xs rounded-full">
                              {med.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.qualityOfLife && (
                      <div className="flex items-center gap-3">
                        {entry.qualityOfLife.sleepQuality !== undefined && (
                          <div className="flex items-center gap-1">
                            <Moon className="h-4 w-4 text-indigo-400 dark:text-indigo-500" />
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">
                              Sleep {entry.qualityOfLife.sleepQuality}/10
                            </span>
                          </div>
                        )}
                        {entry.qualityOfLife.moodImpact !== undefined && (
                          <div className="flex items-center gap-1">
                            <Smile className="h-4 w-4 text-emerald-400 dark:text-emerald-500" />
                            <span className="text-xs text-emerald-600 dark:text-emerald-400">
                              Mood {entry.qualityOfLife.moodImpact}/10
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {entry.weather && (
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-blue-400 dark:text-blue-500" />
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {entry.weather}
                        </span>
                      </div>
                    )}

                    {entry.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        "{entry.notes}"
                      </p>
                    )}

                    {/* Extended details: functional impact, work impact, treatments, etc. */}
                    <ExtendedEntryDetails entry={entry} compact className="mt-3 pt-3 border-t border-border/60" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 p-8 text-center">
              <div className="flex h-12 w-12 mx-auto mb-4 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                Select a Day
              </h3>
              <p className="text-sm text-muted-foreground">
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

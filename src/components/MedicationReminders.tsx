import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { cn } from '../design-system/utils';
import { saveAlert } from './AlertsActivityLog';
import { useToast } from './feedback';
import {
  loadReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  Reminder,
  saveReminders,
} from '../services/reminders';

type MedicationRemindersProps = {
  variant?: 'overlay' | 'inline';
  className?: string;
  onClose?: () => void;
};

function getScheduledTimes(reminder: Reminder) {
  return reminder.times && reminder.times.length > 0 ? reminder.times : [reminder.time];
}

function getNextOccurrenceDate(reminder: Reminder): Date | null {
  try {
    const times = getScheduledTimes(reminder);
    const now = new Date();
    let soonest: Date | null = null;

    for (const t of times) {
      const [hh, mm] = t.split(':').map(Number);
      if (Number.isNaN(hh) || Number.isNaN(mm)) {
        continue;
      }
      const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
      if (candidate <= now) {
        if (reminder.recurrence === 'daily') {
          candidate.setDate(candidate.getDate() + 1);
        } else if (reminder.recurrence === 'weekly') {
          candidate.setDate(candidate.getDate() + 7);
        } else if (reminder.frequency === 'twice-daily' || reminder.frequency === 'custom') {
          // For multi-time schedules without recurrence, advance to next day to avoid stale timestamps
          candidate.setDate(candidate.getDate() + 1);
        }
      }
      if (!soonest || candidate < soonest) {
        soonest = candidate;
      }
    }
    return soonest;
  } catch {
    return null;
  }
}

function formatNextOccurrence(reminder: Reminder) {
  const next = getNextOccurrenceDate(reminder);
  return next ? next.toLocaleString() : reminder.time;
}

function addHoursToTime(t: string, hours: number) {
  try {
    const [hh, mm] = t.split(':').map(Number);
    const d = new Date();
    d.setHours(hh + hours, mm, 0, 0);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  } catch {
    return t;
  }
}

function buildAlertMessage(reminder: Reminder) {
  const detailParts = [reminder.title];
  if (reminder.dosage) detailParts.push(reminder.dosage);
  if (reminder.notes) detailParts.push(reminder.notes);
  return detailParts.join(' • ');
}

export default function MedicationReminders({
  variant = 'overlay',
  className,
  onClose,
}: MedicationRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>(() => loadReminders());
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [extraTimes, setExtraTimes] = useState<string[]>([]);
  const [dosage, setDosage] = useState('');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
  const [frequency, setFrequency] = useState<
    'once' | 'daily' | 'twice-daily' | 'weekly' | 'custom'
  >('once');

  const isFrequency = (value: string): value is typeof frequency =>
    value === 'once' ||
    value === 'daily' ||
    value === 'twice-daily' ||
    value === 'weekly' ||
    value === 'custom';

  const isRecurrence = (value: string): value is typeof recurrence =>
    value === 'none' || value === 'daily' || value === 'weekly';
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);
  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (open) {
      prevActiveRef.current = document.activeElement as HTMLElement | null;
      if (prefersReduced) {
        setSlideIn(true);
        return;
      }
      setSlideIn(false);
      const t = window.setTimeout(() => setSlideIn(true), 10);
      return () => window.clearTimeout(t);
    }
    setSlideIn(false);
    try {
      prevActiveRef.current?.focus();
    } catch {
      // Focus restoration failed
    }
  }, [open]);

  const emitReminder = useCallback((reminder: Reminder) => {
    const message = buildAlertMessage(reminder);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification('Medication reminder', { body: message });
      } catch {
        // Notification failed; continue with other channels
      }
    }

    saveAlert({
      id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      time: new Date().toISOString(),
      message: `Medication reminder: ${message}`,
    });

    try {
      toastRef.current?.bottomLeft?.info?.('Medication reminder', message);
    } catch {
      // toast provider unavailable
    }
  }, []);

  useEffect(() => {
    let timeoutId: number | null = null;
    let intervalId: number | null = null;

    const shouldTrigger = (reminder: Reminder, currentHhmm: string) => {
      return getScheduledTimes(reminder).some(t => t === currentHhmm);
    };

    const runCheck = () => {
      const now = new Date();
      const hhmm = now.toTimeString().slice(0, 5);
      const fired: Reminder[] = [];

      setReminders(prev => {
        let changed = false;
        const next = prev.map(reminder => {
          if (!reminder.enabled) {
            return reminder;
          }

          if (!shouldTrigger(reminder, hhmm)) {
            return reminder;
          }

          fired.push(reminder);

          if (reminder.recurrence === 'none') {
            changed = true;
            return { ...reminder, enabled: false };
          }

          return reminder;
        });

        if (changed) {
          saveReminders(next);
          return next;
        }

        return prev;
      });

      if (fired.length) {
        fired.forEach(emitReminder);
      }
    };

    const scheduleNextRun = () => {
      const now = new Date();
      const remainingMs = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      timeoutId = window.setTimeout(
        () => {
          runCheck();
          intervalId = window.setInterval(runCheck, 60_000);
        },
        Math.max(250, remainingMs)
      );
    };

    runCheck();
    scheduleNextRun();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [emitReminder]);

  const handleAdd = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    const normalizedTimes = (() => {
      if (frequency === 'twice-daily') {
        return [time, extraTimes[0] || addHoursToTime(time, 12)];
      }
      if (frequency === 'custom') {
        const unique = Array.from(new Set([time, ...extraTimes.filter(Boolean)]));
        return unique.length > 0 ? unique : undefined;
      }
      return undefined;
    })();

    const next = createReminder(reminders, {
      title: trimmedTitle,
      time,
      enabled: true,
      dosage: dosage || undefined,
      recurrence,
      frequency,
      notes: notes || undefined,
      times: normalizedTimes,
    });

    setReminders(next);
    setTitle('');
    setDosage('');
    setRecurrence('none');
    setFrequency('once');
    setNotes('');
    setExtraTimes([]);

    try {
      toastRef.current?.bottomLeft?.success?.(
        'Reminder saved',
        `${trimmedTitle} has been scheduled.`
      );
    } catch {
      // toast optional
    }
  };

  const addExtraTime = () => {
    setExtraTimes(prev => [...prev, '12:00']);
  };

  const updateExtraTime = (idx: number, value: string) => {
    setExtraTimes(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const removeExtraTime = (idx: number) => {
    setExtraTimes(prev => prev.filter((_, i) => i !== idx));
  };

  const activeCount = useMemo(() => reminders.filter(r => r.enabled).length, [reminders]);

  const nextReminder = useMemo(() => {
    const dated = reminders
      .filter(r => r.enabled)
      .map(r => ({ reminder: r, date: getNextOccurrenceDate(r) }))
      .filter((entry): entry is { reminder: Reminder; date: Date } => Boolean(entry.date));

    if (!dated.length) {
      return null;
    }

    dated.sort((a, b) => a.date.getTime() - b.date.getTime());
    return dated[0];
  }, [reminders]);

  const closeOverlay = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose]);

  const hasReminders = reminders.length > 0;

  const renderPanel = (showCloseButton: boolean) => (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Medication Reminders</h3>
          <p className="text-sm text-muted-foreground">
            Create gentle prompts so important doses stay on track.
          </p>
        </div>
        {showCloseButton && (
          <button className="btn btn-sm" onClick={closeOverlay}>
            Close
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex flex-col gap-2">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Medication name"
              className="input w-full"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="input"
              />
              <input
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                placeholder="Dosage (e.g. 10mg)"
                className="input"
              />
              <select
                value={frequency}
                onChange={e => {
                  const next = e.target.value;
                  if (isFrequency(next)) {
                    setFrequency(next);
                  }
                }}
                className="input"
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="twice-daily">Twice daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {(frequency === 'twice-daily' || frequency === 'custom') && (
              <div className="flex flex-col gap-2">
                {frequency === 'twice-daily' ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="input"
                    />
                    <input
                      type="time"
                      value={extraTimes[0] || addHoursToTime(time, 12)}
                      onChange={e => updateExtraTime(0, e.target.value)}
                      className="input"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {extraTimes.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={t}
                          onChange={e => updateExtraTime(idx, e.target.value)}
                          className="input"
                        />
                        <button className="btn btn-sm" onClick={() => removeExtraTime(idx)}>
                          Remove
                        </button>
                      </div>
                    ))}
                    <button className="btn btn-sm" onClick={addExtraTime}>
                      Add time
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={recurrence}
                onChange={e => {
                  const next = e.target.value;
                  if (isRecurrence(next)) {
                    setRecurrence(next);
                  }
                }}
                className="input"
              >
                <option value="none">No recurrence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes (e.g. before meals)"
                className="input flex-1"
              />
              <button onClick={handleAdd} className="btn" disabled={!title.trim()}>
                Add reminder
              </button>
            </div>
          </div>
        </div>

        <div>
          {hasReminders ? (
            <ul className="space-y-3">
              {reminders.map(r => (
                <li
                  key={r.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-3 bg-card/80"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.title}</span>
                      {!r.enabled && (
                        <span className="text-xs text-muted-foreground rounded-full border px-2 py-0.5">
                          Paused
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getScheduledTimes(r).join(' • ')}
                      {r.dosage ? ` • ${r.dosage}` : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Frequency: {r.frequency ?? r.recurrence ?? 'once'}
                      {r.notes ? ` • ${r.notes}` : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Next: {formatNextOccurrence(r)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      onClick={() =>
                        setReminders(prev => updateReminder(prev, r.id, { enabled: !r.enabled }))
                      }
                      className="btn btn-sm"
                    >
                      {r.enabled ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => setReminders(prev => deleteReminder(prev, r.id))}
                      className="btn btn-sm btn-outline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
              No reminders yet. Add your first schedule above to see it here.
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (variant === 'inline') {
    return (
      <div className={cn('bg-card border rounded-lg shadow-sm p-4 space-y-4', className)}>
        {renderPanel(false)}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setOpen(true)}
          className="bg-white border rounded-md px-3 py-2 shadow-sm text-sm flex items-center gap-2"
        >
          Medication Reminders
          {activeCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {activeCount} active
            </span>
          )}
          {nextReminder && (
            <span className="text-xs text-muted-foreground">
              Next:{' '}
              {nextReminder.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100]" role="presentation">
          <div className="absolute inset-0 bg-black/40" onClick={closeOverlay} />
          <FocusTrap
            active={true}
            focusTrapOptions={{
              clickOutsideDeactivates: true,
              escapeDeactivates: true,
              onDeactivate: closeOverlay,
            }}
          >
            <div
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              className={`absolute right-0 top-0 h-full w-full md:w-96 bg-card shadow-xl border-l p-4 overflow-auto transform transition-transform duration-200 ${slideIn ? 'translate-x-0' : 'translate-x-full'}`}
            >
              {renderPanel(true)}
            </div>
          </FocusTrap>
        </div>
      )}
    </>
  );
}

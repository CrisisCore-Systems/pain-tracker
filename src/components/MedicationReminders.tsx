import React, { useEffect, useState, useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { loadReminders, createReminder, updateReminder, deleteReminder, Reminder } from '../services/reminders';

function formatNextOccurrence(r: Reminder) {
  try {
    const [hh, mm] = r.time.split(':').map(Number);
    const now = new Date();
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
    if (candidate > now) {
      return candidate.toLocaleString();
    }
    if (r.recurrence === 'daily') {
      const next = new Date(candidate.getTime() + 24 * 60 * 60 * 1000);
      return next.toLocaleString();
    }
    if (r.recurrence === 'weekly') {
      const next = new Date(candidate.getTime() + 7 * 24 * 60 * 60 * 1000);
      return next.toLocaleString();
    }
    // none: already passed today
    return candidate.toLocaleString();
  } catch (e) {
    return r.time;
  }
}

export default function MedicationReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(() => loadReminders());
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [extraTimes, setExtraTimes] = useState<string[]>([]);
  const [dosage, setDosage] = useState('');
  const [recurrence, setRecurrence] = useState<'none'|'daily'|'weekly'>('none');
  const [frequency, setFrequency] = useState<'once'|'daily'|'twice-daily'|'weekly'|'custom'>('once');
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (open) {
      prevActiveRef.current = document.activeElement as HTMLElement | null;
      if (prefersReduced) { setSlideIn(true); return; }
      setSlideIn(false);
      const t = window.setTimeout(() => setSlideIn(true), 10);
      return () => clearTimeout(t);
    } else {
      setSlideIn(false);
      try { prevActiveRef.current?.focus(); } catch {}
    }
  }, [open]);

  useEffect(() => {
    // lightweight scheduler: check every minute and trigger notification when time matches and enabled
    const tick = setInterval(() => {
      const now = new Date();
      const hhmm = now.toTimeString().slice(0,5);
      reminders.forEach(r => {
        if (!r.enabled) return;
        // determine scheduled times (support legacy `time` and new `times`)
        const scheduled = (r.times && r.times.length > 0) ? r.times : [r.time];
        // check if any scheduled time matches
        if (scheduled.includes(hhmm)) {
          if (Notification && Notification.permission === 'granted') {
            const body = `${r.title}${r.dosage ? ` — ${r.dosage}` : ''}`;
            new Notification('Medication reminder', { body });
          }
          // if recurrence is none, disable after firing once
          if (r.recurrence === 'none') {
            updateReminder(reminders, r.id, { enabled: false });
          }
        }
      });
    }, 60000);
    return () => clearInterval(tick);
  }, [reminders]);

  function handleAdd() {
    // determine times to persist
    const times = frequency === 'twice-daily' ? [time, (extraTimes[0] || addHoursToTime(time, 12))] : (frequency === 'custom' ? extraTimes.length > 0 ? extraTimes : [time] : undefined);
    const next = createReminder(reminders, { title, time, enabled: true, dosage: dosage || undefined, recurrence, frequency, notes: notes || undefined, times });
    setReminders(next);
    setTitle('');
    setDosage('');
    setRecurrence('none');
    setFrequency('once');
    setNotes('');
    setExtraTimes([]);
  }

  function addExtraTime() {
    setExtraTimes(prev => [...prev, '12:00']);
  }

  function updateExtraTime(idx: number, value: string) {
    setExtraTimes(prev => prev.map((t,i) => i === idx ? value : t));
  }

  function removeExtraTime(idx: number) {
    setExtraTimes(prev => prev.filter((_,i) => i !== idx));
  }

  function addHoursToTime(t: string, hours: number) {
    try {
      const [hh, mm] = t.split(':').map(Number);
      const d = new Date();
      d.setHours(hh + hours, mm, 0, 0);
      const h = String(d.getHours()).padStart(2,'0');
      const m = String(d.getMinutes()).padStart(2,'0');
      return `${h}:${m}`;
    } catch { return t; }
  }

  return (
    <>
      {/* Compact trigger button - placed in the fixed right-side stack in App */}
      <div className="flex items-center space-x-2">
        <button onClick={() => setOpen(true)} className="bg-white border rounded-md px-3 py-2 shadow-sm text-sm">
          Medication Reminders
        </button>
      </div>

      {/* Slide-over drawer */}
      {open && (
        <div className="fixed inset-0 z-50" role="presentation">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <FocusTrap active={true} focusTrapOptions={{ clickOutsideDeactivates: true, escapeDeactivates: true, onDeactivate: () => setOpen(false) }}>
          <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className={`absolute right-0 top-0 h-full w-full md:w-96 bg-card shadow-xl border-l p-4 overflow-auto transform transition-transform duration-200 ${slideIn ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Medication Reminders</h3>
              <div className="flex items-center space-x-2">
                <button className="btn btn-sm" onClick={() => setOpen(false)}>Close</button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Medication name" className="input w-full" />
                <div className="flex gap-2 items-center">
                  <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="input" />
                  <input value={dosage} onChange={e=>setDosage(e.target.value)} placeholder="Dosage (e.g. 10mg)" className="input" />
                  <select value={frequency} onChange={e=>setFrequency(e.target.value as any)} className="input">
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="twice-daily">Twice daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {(frequency === 'twice-daily' || frequency === 'custom') && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="input" />
                      {frequency === 'twice-daily' ? (
                        <input type="time" value={extraTimes[0] || addHoursToTime(time, 12)} onChange={e=>updateExtraTime(0, e.target.value)} className="input" />
                      ) : (
                        <div className="flex flex-col w-full">
                          {extraTimes.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input type="time" value={t} onChange={e=>updateExtraTime(idx, e.target.value)} className="input" />
                              <button className="btn btn-sm" onClick={() => removeExtraTime(idx)}>Remove</button>
                            </div>
                          ))}
                          <div>
                            <button className="btn btn-sm" onClick={addExtraTime}>Add time</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  <select value={recurrence} onChange={e=>setRecurrence(e.target.value as any)} className="input">
                    <option value="none">No recurrence</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (e.g. before meals)" className="input flex-1" />
                  <button onClick={handleAdd} className="btn">Add</button>
                </div>
              </div>

              <div>
                <ul className="space-y-3">
                  {reminders.map(r => (
                    <li key={r.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.title}</div>
                        <div className="text-sm text-muted-foreground">{(r.times && r.times.length > 0) ? r.times.join(' • ') : r.time} {r.enabled ? '' : '(disabled)'}</div>
                        <div className="text-xs text-muted-foreground">{r.dosage ? `${r.dosage} •` : ''} {r.frequency ?? r.recurrence}</div>
                        <div className="text-sm text-muted-foreground">Next: {formatNextOccurrence(r)}</div>
                      </div>
                      <div className="space-x-2">
                        <button onClick={() => { setReminders(updateReminder(reminders, r.id, { enabled: !r.enabled })); }} className="btn btn-sm">{r.enabled ? 'Disable' : 'Enable'}</button>
                        <button onClick={() => setReminders(deleteReminder(reminders, r.id))} className="btn btn-sm">Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          </FocusTrap>
        </div>
      )}
    </>
  );
}

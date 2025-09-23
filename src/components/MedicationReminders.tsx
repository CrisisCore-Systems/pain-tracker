import React, { useEffect, useState } from 'react';
import { loadReminders, createReminder, updateReminder, deleteReminder, Reminder } from '../services/reminders';

export default function MedicationReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(() => loadReminders());
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');

  useEffect(() => {
    // lightweight scheduler: check every minute and trigger notification when time matches and enabled
    const tick = setInterval(() => {
      const now = new Date();
      const hhmm = now.toTimeString().slice(0,5);
      reminders.forEach(r => {
        if (r.enabled && r.time === hhmm) {
          if (Notification && Notification.permission === 'granted') {
            new Notification('Medication reminder', { body: r.title });
          }
        }
      });
    }, 60000);
    return () => clearInterval(tick);
  }, [reminders]);

  function handleAdd() {
    const next = createReminder(reminders, { title, time, enabled: true });
    setReminders(next);
    setTitle('');
  }

  return (
    <div className="p-4 bg-card rounded-md border">
      <h3 className="text-lg font-semibold mb-2">Medication Reminders</h3>
      <div className="flex gap-2 mb-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Medication name" className="input" />
        <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="input" />
        <button onClick={handleAdd} className="btn">Add</button>
      </div>
      <ul className="space-y-2">
        {reminders.map(r => (
          <li key={r.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-sm text-muted-foreground">{r.time} {r.enabled ? '' : '(disabled)'}</div>
            </div>
            <div className="space-x-2">
              <button onClick={() => { setReminders(updateReminder(reminders, r.id, { enabled: !r.enabled })); }} className="btn btn-sm">{r.enabled ? 'Disable' : 'Enable'}</button>
              <button onClick={() => setReminders(deleteReminder(reminders, r.id))} className="btn btn-sm">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

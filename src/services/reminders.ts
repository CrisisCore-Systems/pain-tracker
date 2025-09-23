export type Reminder = {
  id: string;
  title: string;
  time: string; // ISO time HH:MM
  enabled: boolean;
};

const STORAGE_KEY = 'pain-tracker:medication-reminders';

export function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Reminder[] : [];
  } catch (e) {
    console.debug('reminders: load failed', e);
    return [];
  }
}

export function saveReminders(reminders: Reminder[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.debug('reminders: save failed', e);
  }
}

export function createReminder(reminders: Reminder[], r: Omit<Reminder,'id'>) {
  const id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const next = [...reminders, { ...r, id }];
  saveReminders(next);
  return next;
}

export function updateReminder(reminders: Reminder[], id: string, patch: Partial<Reminder>) {
  const next = reminders.map(r => r.id === id ? { ...r, ...patch } : r);
  saveReminders(next);
  return next;
}

export function deleteReminder(reminders: Reminder[], id: string) {
  const next = reminders.filter(r => r.id !== id);
  saveReminders(next);
  return next;
}

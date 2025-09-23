import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'pain-tracker:alerts-settings';

type Settings = { threshold: number };

export default function AlertsSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : { threshold: 3 }; } catch { return { threshold: 3 }; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
  }, [settings]);

  return (
    <div className="p-4 bg-card rounded-md border">
      <h3 className="text-lg font-semibold mb-2">Alerts settings</h3>
      <label className="block text-sm mb-2">Sensitivity (pain increase threshold)</label>
      <input type="range" min={1} max={6} value={settings.threshold} onChange={e => setSettings({ threshold: Number(e.target.value) })} />
      <div className="text-sm mt-2">Current threshold: {settings.threshold} points</div>
    </div>
  );
}

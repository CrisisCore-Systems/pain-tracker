import { useState, useMemo } from 'react';
import { MapPin, Clock, Save, AlertCircle } from 'lucide-react';
import { InteractiveBodyMap } from './InteractiveBodyMap';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

// Region display name lookup — mirrors BODY_REGIONS from InteractiveBodyMap
const REGION_DISPLAY_NAMES: Record<string, string> = {
  head: 'Head', neck: 'Neck',
  'left-shoulder': 'Left Shoulder', 'right-shoulder': 'Right Shoulder',
  'left-upper-arm': 'Left Upper Arm', 'right-upper-arm': 'Right Upper Arm',
  'left-elbow': 'Left Elbow', 'right-elbow': 'Right Elbow',
  'left-forearm': 'Left Forearm', 'right-forearm': 'Right Forearm',
  'left-hand': 'Left Hand', 'right-hand': 'Right Hand',
  chest: 'Chest', 'upper-back': 'Upper Back',
  abdomen: 'Abdomen', 'lower-back': 'Lower Back',
  'left-hip': 'Left Hip', 'right-hip': 'Right Hip',
  'left-thigh-outer': 'Left Outer Thigh', 'left-thigh-inner': 'Left Inner Thigh',
  'right-thigh-outer': 'Right Outer Thigh', 'right-thigh-inner': 'Right Inner Thigh',
  'left-knee-outer': 'Left Outer Knee', 'left-knee-inner': 'Left Inner Knee',
  'right-knee-outer': 'Right Outer Knee', 'right-knee-inner': 'Right Inner Knee',
  'left-shin-outer': 'Left Outer Shin', 'left-shin-inner': 'Left Inner Shin',
  'right-shin-outer': 'Right Outer Shin', 'right-shin-inner': 'Right Inner Shin',
  'left-calf-outer': 'Left Outer Calf', 'left-calf-inner': 'Left Inner Calf',
  'right-calf-outer': 'Right Outer Calf', 'right-calf-inner': 'Right Inner Calf',
  'left-ankle': 'Left Ankle', 'right-ankle': 'Right Ankle',
  'left-foot-lateral': 'Left Foot (Outer)', 'left-foot-medial': 'Left Foot (Inner)',
  'right-foot-lateral': 'Right Foot (Outer)', 'right-foot-medial': 'Right Foot (Inner)',
  'left-toes-lateral': 'Left Toes (Outer)', 'left-toes-medial': 'Left Toes (Inner)',
  'right-toes-lateral': 'Right Toes (Outer)', 'right-toes-medial': 'Right Toes (Inner)',
};

function getDisplayName(regionId: string): string {
  return REGION_DISPLAY_NAMES[regionId] ?? regionId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Pain level to color + label
function getPainMeta(level: number): { color: string; label: string; trackColor: string } {
  if (level <= 2) return { color: 'text-emerald-600', label: 'Minimal', trackColor: 'bg-emerald-400' };
  if (level <= 4) return { color: 'text-yellow-600', label: 'Mild', trackColor: 'bg-yellow-400' };
  if (level <= 6) return { color: 'text-amber-600', label: 'Moderate', trackColor: 'bg-amber-500' };
  if (level <= 8) return { color: 'text-orange-600', label: 'Severe', trackColor: 'bg-orange-500' };
  return { color: 'text-red-600', label: 'Very Severe', trackColor: 'bg-red-500' };
}

export function BodyMapPage() {
  const { entries, addEntry } = usePainTrackerStore();
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  // Deduplicated recent region IDs from last 5 entries
  const recentRegions = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const e of entries.slice(0, 5)) {
      for (const loc of (e.baselineData?.locations ?? [])) {
        if (!seen.has(loc)) { seen.add(loc); result.push(loc); }
      }
      if (result.length >= 5) break;
    }
    return result;
  }, [entries]);

  const painMeta = getPainMeta(painLevel);

  const handleSaveEntry = () => {
    if (selectedRegions.length === 0) return;

    setIsSaving(true);
    try {
      void addEntry({
        baselineData: { pain: painLevel, locations: selectedRegions, symptoms: [] },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: notes || '',
      });
      setSelectedRegions([]);
      setPainLevel(5);
      setNotes('');
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Body Map</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Tap body regions to mark pain locations, then record the intensity.
        </p>
      </div>

      {/* Saved confirmation banner */}
      {savedBanner && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl
          bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800
          text-emerald-700 dark:text-emerald-400 text-sm font-medium" role="status">
          <Save className="h-4 w-4 flex-shrink-0" />
          Entry saved successfully.
        </div>
      )}

      {/* Main layout: body map + sidebar */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* Body map — takes 60% on desktop */}
        <div className="w-full lg:flex-1 rounded-2xl border border-slate-200 dark:border-gray-700
          bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-1 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {selectedRegions.length === 0
                ? 'Select locations'
                : `${selectedRegions.length} location${selectedRegions.length !== 1 ? 's' : ''} marked`}
            </span>
            {selectedRegions.length > 0 && (
              <button
                onClick={() => setSelectedRegions([])}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="p-3">
            <InteractiveBodyMap
              selectedRegions={selectedRegions}
              onRegionSelect={setSelectedRegions}
              mode="selection"
              height={680}
            />
          </div>
        </div>

        {/* Sidebar: pain level + notes + save */}
        <div className="w-full lg:w-72 xl:w-80 space-y-4 lg:sticky lg:top-6">

          {/* Recent locations quick-add */}
          {recentRegions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-gray-700
              bg-white dark:bg-gray-900 p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Recent
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentRegions.map(regionId => {
                  const isAdded = selectedRegions.includes(regionId);
                  return (
                    <button
                      key={regionId}
                      onClick={() => {
                        if (!isAdded) setSelectedRegions(prev => [...prev, regionId]);
                        else setSelectedRegions(prev => prev.filter(r => r !== regionId));
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                        ${isAdded
                          ? 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/40 dark:border-rose-700 dark:text-rose-300'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-gray-800 dark:border-gray-600 dark:text-slate-400 dark:hover:bg-gray-700'
                        }`}
                    >
                      {getDisplayName(regionId)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pain level */}
          <div className="rounded-2xl border border-slate-200 dark:border-gray-700
            bg-white dark:bg-gray-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Pain Level
              </span>
              <span className={`text-sm font-bold tabular-nums ${painMeta.color}`}>
                {painLevel}/10 — {painMeta.label}
              </span>
            </div>
            {/* Custom styled range track */}
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={e => setPainLevel(Number(e.target.value))}
                className="w-full h-2 appearance-none rounded-full cursor-pointer
                  bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500"
                aria-label="Pain level"
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={painLevel}
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 px-0.5">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-slate-200 dark:border-gray-700
            bg-white dark:bg-gray-900 p-4 space-y-2">
            <label
              htmlFor="bodymap-notes"
              className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 block"
            >
              Notes <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              id="bodymap-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe your pain, triggers, or anything relevant…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600
                bg-slate-50 dark:bg-gray-800 text-gray-900 dark:text-white
                text-sm placeholder-slate-400 dark:placeholder-slate-500
                focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:outline-none
                resize-none transition-colors"
              rows={3}
            />
          </div>

          {/* Save / empty state */}
          {selectedRegions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-gray-700
              bg-slate-50/50 dark:bg-gray-900/50 px-4 py-6 text-center space-y-2">
              <MapPin className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select at least one location on the body map to record an entry.
              </p>
            </div>
          ) : (
            <button
              onClick={handleSaveEntry}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-gray-600
                text-white font-semibold text-sm transition-colors shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Entry
                </>
              )}
            </button>
          )}

          {/* Validation hint */}
          {selectedRegions.length === 0 && (
            <div className="flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>You need to mark at least one body region before saving.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

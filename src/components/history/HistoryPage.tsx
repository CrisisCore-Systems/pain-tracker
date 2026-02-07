import { useMemo, useState } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import {
  Search,
  Pencil,
  Clock,
  MapPin,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Moon,
  Smile,
  Cloud,
  FileText,
  CalendarDays,
} from 'lucide-react';
import type { PainEntry } from '../../types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '../../design-system';
import { cn } from '../../design-system/utils';
import { ExtendedEntryDetails } from '../pain-tracker/EntryDetailsSections';

/* ── Pain severity classification & styling ── */

type PainSeverity = 'none' | 'mild' | 'moderate' | 'severe' | 'extreme';

function getPainSeverity(pain: number): PainSeverity {
  if (pain === 0) return 'none';
  if (pain <= 2) return 'mild';
  if (pain <= 5) return 'moderate';
  if (pain <= 7) return 'severe';
  return 'extreme';
}

const severityStyles: Record<
  PainSeverity,
  { border: string; bg: string; text: string; bar: string; label: string }
> = {
  none: {
    border: 'border-l-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    bar: 'bg-emerald-400',
    label: 'None',
  },
  mild: {
    border: 'border-l-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-300',
    bar: 'bg-green-500',
    label: 'Mild',
  },
  moderate: {
    border: 'border-l-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    bar: 'bg-amber-500',
    label: 'Moderate',
  },
  severe: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-300',
    bar: 'bg-orange-500',
    label: 'Severe',
  },
  extreme: {
    border: 'border-l-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-300',
    bar: 'bg-red-500',
    label: 'Extreme',
  },
};

/* ── Day grouping helpers ── */

function groupByDay(entries: PainEntry[]): [string, PainEntry[]][] {
  const map = new Map<string, PainEntry[]>();
  for (const entry of entries) {
    const dayKey = entry.timestamp.split('T')[0] ?? entry.timestamp;
    if (!map.has(dayKey)) map.set(dayKey, []);
    map.get(dayKey)!.push(entry);
  }
  return Array.from(map.entries());
}

function formatDayLabel(dateKey: string): string {
  try {
    const date = parseISO(dateKey);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d, yyyy');
  } catch {
    return dateKey;
  }
}

/* ── Search helper (unchanged for test compatibility) ── */

function stringifyEntry(entry: PainEntry): string {
  const timestampText = format(new Date(entry.timestamp), 'EEE, MMM d, yyyy h:mm a');
  const isoDate = entry.timestamp.split('T')[0] ?? '';

  const locations = (entry.baselineData.locations ?? []).join(' ');
  const symptoms = (entry.baselineData.symptoms ?? []).join(' ');
  const notes = entry.notes ?? '';

  return [timestampText, isoDate, String(entry.baselineData.pain), locations, symptoms, notes]
    .join(' ')
    .toLowerCase();
}

/* ── Sub-components ── */

function EntryMetaChips({ entry }: { entry: PainEntry }) {
  const locations = entry.baselineData.locations ?? [];
  const symptoms = entry.baselineData.symptoms ?? [];
  const sleep = entry.qualityOfLife?.sleepQuality;
  const mood = entry.qualityOfLife?.moodImpact;
  const weather = entry.weather;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {locations.length > 0 && (
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          {locations.length} location{locations.length !== 1 ? 's' : ''}
        </span>
      )}
      {symptoms.length > 0 && (
        <span className="inline-flex items-center gap-1">
          <Stethoscope className="h-3 w-3 shrink-0" aria-hidden="true" />
          {symptoms.length} symptom{symptoms.length !== 1 ? 's' : ''}
        </span>
      )}
      {sleep != null && sleep > 0 && (
        <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
          <Moon className="h-3 w-3 shrink-0" aria-hidden="true" />
          Sleep {sleep}/10
        </span>
      )}
      {mood != null && mood > 0 && (
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <Smile className="h-3 w-3 shrink-0" aria-hidden="true" />
          Mood {mood}/10
        </span>
      )}
      {weather && (
        <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400">
          <Cloud className="h-3 w-3 shrink-0" aria-hidden="true" />
          {weather}
        </span>
      )}
    </div>
  );
}

/* ── Main component ── */

interface HistoryPageProps {
  entries: PainEntry[];
  onEditEntry: (id: PainEntry['id']) => void;
}

export function HistoryPage({ entries, onEditEntry }: HistoryPageProps) {
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<PainEntry['id']>>(new Set());
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (!normalizedQuery) return sorted;

    return sorted.filter(entry => stringifyEntry(entry).includes(normalizedQuery));
  }, [entries, normalizedQuery]);

  const dayGroups = useMemo(() => groupByDay(filtered), [filtered]);

  const resultLabel = useMemo(() => {
    if (!normalizedQuery) return `${entries.length} total`;
    return `${filtered.length} match${filtered.length === 1 ? '' : 'es'}`;
  }, [entries.length, filtered.length, normalizedQuery]);

  const toggleExpand = (id: PainEntry['id']) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* ── Search header ── */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Pain History</CardTitle>
            <CardDescription className="mt-1">
              Search by date, pain level, location, symptoms, or notes.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <Input
              label="Search"
              placeholder="Try: Dec 22, 7, lower back, cramping..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              inputMode="search"
              startIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              fullWidth
            />
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <Badge variant="outline" size="lg">{resultLabel}</Badge>
              {normalizedQuery && (
                <Button type="button" variant="outline" size="sm" onClick={() => setQuery('')}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Results ── */}
      {filtered.length === 0 ? (
        <Card variant="ghost" className="py-16 text-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <FileText className="h-12 w-12 opacity-30" aria-hidden="true" />
            <p className="text-base font-medium">
              {normalizedQuery ? 'No matching entries' : 'No entries yet'}
            </p>
            <p className="text-sm max-w-sm">
              {normalizedQuery
                ? 'Try a different search term — dates, pain levels, locations, or symptoms all work.'
                : 'Your logged pain entries will appear here.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {dayGroups.map(([dayKey, dayEntries]) => (
            <section key={dayKey} aria-label={`Entries for ${formatDayLabel(dayKey)}`}>
              {/* Day header */}
              <div className="sticky top-0 z-10 -mx-1 mb-3 flex items-center gap-2 rounded-md bg-background/80 px-1 py-2 backdrop-blur-sm">
                <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-foreground">
                  {formatDayLabel(dayKey)}
                </h3>
                <span className="text-xs text-muted-foreground">
                  · {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {/* Entry cards */}
              <div className="space-y-3">
                {dayEntries.map(entry => {
                  const pain = entry.baselineData.pain;
                  const severity = getPainSeverity(pain);
                  const styles = severityStyles[severity];
                  const isExpanded = expandedIds.has(entry.id);
                  const locations = entry.baselineData.locations ?? [];
                  const symptoms = entry.baselineData.symptoms ?? [];
                  const hasDetails = locations.length > 0 || symptoms.length > 0 || entry.notes;

                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        'group rounded-lg border border-l-4 bg-card shadow-sm transition-shadow hover:shadow-md',
                        styles.border,
                      )}
                    >
                      {/* Entry header row */}
                      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-2 min-w-0">
                          {/* Pain level + severity bar */}
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={cn(
                                'inline-flex items-center justify-center rounded-md px-2.5 py-1 text-sm font-bold tabular-nums',
                                styles.bg,
                                styles.text,
                              )}
                            >
                              Pain {pain}/10
                            </span>
                            <div className="hidden sm:flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={cn('h-full rounded-full transition-all', styles.bar)}
                                  style={{ width: `${(pain / 10) * 100}%` }}
                                />
                              </div>
                              <span className={cn('text-xs font-medium', styles.text)}>
                                {styles.label}
                              </span>
                            </div>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <time dateTime={entry.timestamp}>
                              {format(new Date(entry.timestamp), 'h:mm a')}
                            </time>
                          </div>

                          {/* Meta chips: locations, symptoms, sleep, mood, weather */}
                          <EntryMetaChips entry={entry} />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 sm:self-start">
                          {hasDetails && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(entry.id)}
                              aria-expanded={isExpanded}
                              aria-controls={`entry-details-${entry.id}`}
                            >
                              {isExpanded ? (
                                <ChevronUp className="mr-1 h-4 w-4" aria-hidden="true" />
                              ) : (
                                <ChevronDown className="mr-1 h-4 w-4" aria-hidden="true" />
                              )}
                              {isExpanded ? 'Less' : 'More'}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onEditEntry(entry.id)}
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {/* Expandable detail section */}
                      {isExpanded && hasDetails && (
                        <div
                          id={`entry-details-${entry.id}`}
                          className="border-t border-border/50 px-4 py-3 space-y-3 text-sm"
                        >
                          {locations.length > 0 && (
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Locations
                              </span>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {locations.map((loc, i) => (
                                  <Badge key={i} variant="secondary" size="sm">
                                    {loc}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {symptoms.length > 0 && (
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Symptoms
                              </span>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {symptoms.map((s, i) => (
                                  <Badge key={i} variant="outline" size="sm">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {entry.notes && (
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Notes
                              </span>
                              <p className="mt-1.5 whitespace-pre-wrap rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground leading-relaxed">
                                {entry.notes}
                              </p>
                            </div>
                          )}

                          {/* Extended details: functional impact, work impact, treatments, comparison */}
                          <ExtendedEntryDetails
                            entry={entry}
                            compact
                            className="mt-2 pt-2 border-t border-border/40"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Search, Pencil } from 'lucide-react';
import type { PainEntry } from '../../types';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '../../design-system';

interface HistoryPageProps {
  entries: PainEntry[];
  onEditEntry: (id: PainEntry['id']) => void;
}

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

export function HistoryPage({ entries, onEditEntry }: HistoryPageProps) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (!normalizedQuery) return sorted;

    return sorted.filter(entry => stringifyEntry(entry).includes(normalizedQuery));
  }, [entries, normalizedQuery]);

  const resultLabel = useMemo(() => {
    if (!normalizedQuery) return `${entries.length} total`;
    return `${filtered.length} match${filtered.length === 1 ? '' : 'es'}`;
  }, [entries.length, filtered.length, normalizedQuery]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            Search by date, pain level, location, symptoms, or notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
              <Badge variant="outline">{resultLabel}</Badge>
              {normalizedQuery && (
                <Button type="button" variant="outline" onClick={() => setQuery('')}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No matching entries.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map(entry => {
                const timestampText = format(new Date(entry.timestamp), 'EEE, MMM d, yyyy h:mm a');
                const locations = entry.baselineData.locations ?? [];
                const symptoms = entry.baselineData.symptoms ?? [];

                return (
                  <div key={entry.id} className="rounded-lg border bg-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">Pain {entry.baselineData.pain}/10</span>
                          <span className="text-sm text-muted-foreground">{timestampText}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{locations.length} location{locations.length === 1 ? '' : 's'}</Badge>
                          <Badge variant="outline">{symptoms.length} symptom{symptoms.length === 1 ? '' : 's'}</Badge>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onEditEntry(entry.id)}
                        className="sm:self-start"
                      >
                        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                        Edit
                      </Button>
                    </div>

                    {locations.length > 0 && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Locations:</span> {locations.join(', ')}
                      </p>
                    )}
                    {symptoms.length > 0 && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Symptoms:</span> {symptoms.join(', ')}
                      </p>
                    )}
                    {entry.notes && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Notes:</span> {entry.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HistoryPage;

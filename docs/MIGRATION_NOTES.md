Migration notes for version 2 — MoodEntry ID & timestamp normalization

Overview
--------
This migration normalizes persisted application state to introduce unique numeric IDs for mood entries, and to ensure all timestamp fields are stored as ISO strings. The migration runs automatically during store rehydration and will update legacy persisted state to the new normalized shape.

What changed
------------
- MoodEntry: `id` (number) added, `timestamp` becomes ISO string (was sometimes Date)
- ActivityLogEntry: ensures `id` (number), `date` ISO string, and activity timestamps are ISO strings
- PainEntry: ensures `id` (number) and `timestamp` ISO string; normalizes nested treatment dates
- ScheduledReport: ensures `id` and ISO strings for `nextRun`/`lastRun`

Developer actions
-----------------
1. Avoid mutating persisted state directly. Use the `makeMoodEntry` factory from `src/utils/mood-entry-factory.ts` when creating new mood entries.
2. If you need to manually update the persistence shape, write a migration under `src/stores/pain-tracker-migrations.ts` and bump the `version` in the store persist config.
3. The migration is designed to run once at rehydrate; ensure any future schema changes follow a similar pattern.

Notes
-----
This migration is backward-compatible for update/delete operations: `updateMoodEntry` and `deleteMoodEntry` accept either an `id` or a `timestamp` string for convenience. Future changes should prefer `id` for persistence operations.

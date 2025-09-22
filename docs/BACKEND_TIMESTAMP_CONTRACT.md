# Backend timestamp contract (proposal)

## Goal

Ensure timestamps returned by server APIs are unambiguous and easy for clients
to render deterministically across timezones.

## Contract

Always return ISO 8601 timestamps with timezone offset (RFC 3339).

- Field name: `timestamp`
- Type: string
- Example: `2025-09-21T14:30:00+00:00`

Local date field (optional)

Include a `localDate` field when the server has a canonical user timezone or
when entries should be bucketed by a user's calendar day.

- Field name: `localDate`
- Type: string (YYYY-MM-DD)
- Example: `2025-09-21`
- Rationale: Avoids client-side timezone inference for server-side calendar
  logic.

Document timezone normalization

If the server normalizes timestamps using user profile settings, document the
behavior in API docs and responses (for example include `userTimezone`).

Preserve original timezone

Preserve the original timezone in logs and audit trails. When normalizing
timestamps for storage, consider keeping `originalTimestamp` plus the
normalized `timestamp`.

### Schema example (pain entry)

```json
{
  "id": "abc123",
  "timestamp": "2025-09-21T14:30:00+00:00",
  "localDate": "2025-09-21",
  "userTimezone": "America/Vancouver",
  "baselineData": { }
}
```

## Migration and notes

- If existing data lacks timezone offsets, adopt a migration strategy. For
  example, assume UTC where ambiguous or provide a migration flag for the
  operator to specify a default timezone.
- Prefer server-provided `localDate` when available. Client-side helpers like
  `localDayStart` are useful when the server cannot provide `localDate`.

If you'd like, I can open a PR with this document and suggested API changes to
the backend team, or add `localDate` population to export endpoints.

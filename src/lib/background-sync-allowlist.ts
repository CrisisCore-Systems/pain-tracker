export type AllowedSyncRoute = {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Canonical API path (must start with /api/). */
  path: `/api/${string}`;
  /** Why this route is safe/necessary to replay offline. */
  reason: string;
};

/**
 * Background sync replay allowlist.
 *
 * Governance rule: adding a new replayable endpoint MUST be an intentional change:
 * - update this list (method + canonical path)
 * - update the pinned CI test
 * - provide a human-readable reason
 */
export const ALLOWED_SYNC_ROUTES = [
  {
    method: 'POST',
    path: '/api/pain-entries',
    reason: 'Offline-first pain entry create replay',
  },
  {
    method: 'PUT',
    path: '/api/pain-entries/:id',
    reason: 'Offline-first pain entry update replay (numeric id only)',
  },
  {
    method: 'POST',
    path: '/api/emergency',
    reason: 'Emergency info submission when connectivity returns',
  },
  {
    method: 'POST',
    path: '/api/activity-logs',
    reason: 'Activity log submission when connectivity returns',
  },
  {
    method: 'PUT',
    path: '/api/settings',
    reason: 'Settings sync when connectivity returns (explicitly bounded)',
  },
] as const satisfies readonly AllowedSyncRoute[];

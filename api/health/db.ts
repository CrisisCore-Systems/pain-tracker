import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import { db } from '../lib/database.js';

/**
 * Simple DB health check
 * GET /api/health/db
 *
 * Returns 200 and { ok: true } when a database is configured and reachable.
 * If no DATABASE_URL is configured, returns 200 with ok: false and a message
 * so environments without a DB don't look like server errors.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const hasDb = Boolean(process.env.DATABASE_URL);

  if (!hasDb) {
    // No database configured in this environment
    res.status(200).json({ ok: false, message: 'No DATABASE_URL configured' });
    return;
  }

  try {
    // Perform a trivial query; for the noop client this will also succeed
    const rows = (await db.query('SELECT 1 as ok')) as Array<{ ok: number }>;
    const ok = Array.isArray(rows) && rows.length > 0 ? rows[0].ok === 1 : true;
    res.status(200).json({ ok });
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as Error)?.message || 'Unknown error' });
  }
}

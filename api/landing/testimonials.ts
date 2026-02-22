import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import { db } from '../../src/lib/database';
import verifyAdmin from '../../api-lib/adminAuth';
import { z } from 'zod';
import { enforceRateLimit, getClientIp, logError } from '../../api-lib/http';

const TestimonialsQuerySchema = z
  .object({
    verified: z.enum(['true', 'false']).optional(),
  })
  .strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const ip = getClientIp(req);
    const ok = await enforceRateLimit({
      req,
      res,
      key: `ip:${ip}:landing:testimonials:list`,
      limit: Number(process.env.ADMIN_RATE_LIMIT || 120),
      windowMs: Number(process.env.ADMIN_RATE_WINDOW_MS || 60 * 1000),
    });
    if (!ok) return;

    // Verify admin using helper (apikey or bearer token validate)
    const auth = await verifyAdmin(req);
    if (!auth.ok) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    if (req.method === 'GET') {
      const q = TestimonialsQuerySchema.safeParse(req.query ?? {});
      if (!q.success) {
        res.status(400).json({ ok: false, error: 'Invalid query' });
        return;
      }

      const { verified } = q.data;
      let rows;
      if (verified === 'true') {
        rows = await db.query('SELECT * FROM testimonials WHERE verified = true ORDER BY created_at DESC');
      } else if (verified === 'false') {
        rows = await db.query('SELECT * FROM testimonials WHERE verified = false ORDER BY created_at DESC');
      } else {
        rows = await db.query('SELECT * FROM testimonials ORDER BY created_at DESC LIMIT 200');
      }
      res.status(200).json({ ok: true, testimonials: rows });
      return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    logError('Testimonials list error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

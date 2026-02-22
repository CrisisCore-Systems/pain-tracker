import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import { db } from '../../src/lib/database';
import verifyAdmin from '../../api-lib/adminAuth';
import { z } from 'zod';
import { enforceRateLimit, getClientIp, logError } from '../../api-lib/http';

type TestimonialVerifyBody = {
  id?: unknown;
  verified?: unknown;
  anonymized?: unknown;
  publication_date?: unknown;
};

const VerifyBodySchema = z
  .object({
    id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).max(20)]),
    verified: z.boolean(),
    anonymized: z.boolean().optional(),
    publication_date: z.union([z.string().max(32), z.null()]).optional(),
  })
  .strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed' });
      return;
    }

    const ip = getClientIp(req);
    const ok = await enforceRateLimit({
      req,
      res,
      key: `ip:${ip}:landing:testimonials:verify`,
      limit: Number(process.env.ADMIN_RATE_LIMIT || 120),
      windowMs: Number(process.env.ADMIN_RATE_WINDOW_MS || 60 * 1000),
    });
    if (!ok) return;

    const auth = await verifyAdmin(req);
    if (!auth.ok) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    const raw = (req.body ?? {}) as TestimonialVerifyBody;
    const parsed = VerifyBodySchema.safeParse(raw);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: 'Invalid request body' });
      return;
    }

    const { id, verified, anonymized, publication_date } = parsed.data;
    const idValue = typeof id === 'string' ? Number(id) : id;

    // Update testimonial row
    const verifiedByRaw = req.headers['x-admin-user'] || 'admin';
    const verifiedBy = Array.isArray(verifiedByRaw) ? verifiedByRaw[0] : String(verifiedByRaw);
    const safeActor = verifiedBy.trim().slice(0, 64) || 'admin';
    const verifiedAt = verified ? 'CURRENT_TIMESTAMP' : null;

    // Build query
    const q = `UPDATE testimonials SET verified = $1, anonymized = COALESCE($2, anonymized), verified_by = $3, verified_at = ${verifiedAt || 'NULL'}, publication_date = $4 WHERE id = $5 RETURNING *`;
    const params = [
      !!verified,
      anonymized === undefined ? null : anonymized,
      safeActor,
      publication_date ?? null,
      idValue,
    ];

    const result = await db.query(q, params);
    if (!result || result.length === 0) {
      res.status(404).json({ ok: false, error: 'Not found' });
      return;
    }

    // Audit log
    await db.query(
      `INSERT INTO testimonials_audit (testimonial_id, action, actor, details) VALUES ($1, $2, $3, $4)`,
      [idValue, 'verify', safeActor, JSON.stringify({ verified, anonymized, publication_date })]
    );

    res.status(200).json({ ok: true, updated: result[0] });
  } catch (err) {
    logError('Testimonials verify error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

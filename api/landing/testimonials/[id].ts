import type { VercelRequest, VercelResponse } from '../../../src/types/vercel';
import { db } from '../../../src/lib/database';
import verifyAdmin from '../../../api-lib/adminAuth';

type TestimonialPatchBody = {
  anonymized?: unknown;
  name?: unknown;
  role?: unknown;
  quote?: unknown;
  publication_date?: unknown;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ ok: false, error: 'Missing id' });
      return;
    }

    if (req.method === 'PATCH') {
      const auth = await verifyAdmin(req);
      if (!auth.ok) {
        res.status(401).json({ ok: false, error: 'Unauthorized' });
        return;
      }

      const body = (req.body ?? {}) as TestimonialPatchBody;
      const { anonymized, name, role, quote, publication_date } = body;
      // Build update dynamically
      const sets: string[] = [];
      const params: unknown[] = [];
      let idx = 1;
      if (anonymized !== undefined) {
        sets.push(`anonymized = $${idx++}`);
        params.push(!!anonymized);
      }
      if (name !== undefined) {
        sets.push(`name = $${idx++}`);
        params.push(name);
      }
      if (role !== undefined) {
        sets.push(`role = $${idx++}`);
        params.push(role);
      }
      if (quote !== undefined) {
        sets.push(`quote = $${idx++}`);
        params.push(quote);
      }
      if (publication_date !== undefined) {
        sets.push(`publication_date = $${idx++}`);
        params.push(publication_date);
      }

      if (sets.length === 0) {
        res.status(400).json({ ok: false, error: 'No changes provided' });
        return;
      }

      params.push(id);
      const query = `UPDATE testimonials SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
      const result = await db.query(query, params);

      await db.query('INSERT INTO testimonials_audit (testimonial_id, action, actor, details) VALUES ($1, $2, $3, $4)', [id, 'update', req.headers['x-admin-user'] || 'admin', JSON.stringify({ changes: params })]);

      res.status(200).json({ ok: true, updated: result[0] });
      return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Testimonials id endpoint error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

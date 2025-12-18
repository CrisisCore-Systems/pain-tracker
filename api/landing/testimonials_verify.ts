import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import { db } from '../../src/lib/database';
import verifyAdmin from '../lib/adminAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed' });
      return;
    }

    const auth = await verifyAdmin(req);
    if (!auth.ok) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    const { id, verified, anonymized, publication_date } = req.body || {};
    if (!id) {
      res.status(400).json({ ok: false, error: 'Missing id' });
      return;
    }

    // Update testimonial row
    const verifiedBy = req.headers['x-admin-user'] || 'admin';
    const verifiedAt = verified ? 'CURRENT_TIMESTAMP' : null;

    // Build query
    const q = `UPDATE testimonials SET verified = $1, anonymized = COALESCE($2, anonymized), verified_by = $3, verified_at = ${verifiedAt || 'NULL'}, publication_date = $4 WHERE id = $5 RETURNING *`;
    const params = [!!verified, anonymized === undefined ? null : anonymized, String(verifiedBy), publication_date || null, id];

    const result = await db.query(q, params);
    if (!result || result.length === 0) {
      res.status(404).json({ ok: false, error: 'Not found' });
      return;
    }

    // Audit log
    await db.query(
      `INSERT INTO testimonials_audit (testimonial_id, action, actor, details) VALUES ($1, $2, $3, $4)`,
      [id, 'verify', String(verifiedBy), JSON.stringify({ verified, anonymized, publication_date })]
    );

    res.status(200).json({ ok: true, updated: result[0] });
  } catch (err) {
    console.error('Testimonials verify error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

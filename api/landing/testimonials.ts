import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import { db } from '../../src/lib/database';
import verifyAdmin from '../lib/adminAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Verify admin using helper (apikey or bearer token validate)
    const auth = await verifyAdmin(req);
    if (!auth.ok) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    if (req.method === 'GET') {

      const { verified } = req.query;
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
    console.error('Testimonials list error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

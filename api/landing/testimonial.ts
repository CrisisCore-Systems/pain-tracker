import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../src/lib/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { name, role, email, quote, anonymized, consent } = req.body || {};

    // Basic validation
    if (!quote || typeof quote !== 'string') {
      res.status(400).json({ error: 'Quote is required' });
      return;
    }

    // Consent required
    if (!consent) {
      res.status(400).json({ error: 'Consent is required to submit a testimonial' });
      return;
    }

    const sanitizedName = anonymized ? null : (name || null);
    const sanitizedRole = role || null;
    const sanitizedEmail = email || null;
    const isAnonymized = !!anonymized;

    const result = await db.query(
      `INSERT INTO testimonials (name, role, email, quote, anonymized, verified, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [sanitizedName, sanitizedRole, sanitizedEmail, quote, isAnonymized, false, null]
    );

    res.status(201).json({ ok: true, created: result[0] });
  } catch (err) {
    console.error('Testimonial submission error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

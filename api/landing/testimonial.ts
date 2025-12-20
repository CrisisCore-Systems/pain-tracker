import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import { db } from '../../src/lib/database';
import rateLimiter from '../../api-lib/rateLimiter';

type TestimonialRequestBody = {
  name?: unknown;
  role?: unknown;
  email?: unknown;
  quote?: unknown;
  anonymized?: unknown;
  consent?: unknown;
  recaptchaToken?: unknown;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = (req.body ?? {}) as TestimonialRequestBody;
    const { name, role, email, quote, anonymized, consent, recaptchaToken } = body;

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

    const sanitizedName = anonymized ? null : ((typeof name === 'string' && name) ? name : null);
    const sanitizedRole = typeof role === 'string' && role ? role : null;
    const sanitizedEmail = typeof email === 'string' && email ? email : null;
    const isAnonymized = !!anonymized;

    // Rate limit using in-memory limiter with DB fallback for safety
    const ipraw = req.headers['x-forwarded-for'] || req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const ipStr = Array.isArray(ipraw) ? ipraw[0] : (ipraw || 'unknown');
    const rateLimitWindowMs = Number(process.env.REQ_RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000);
    const rateLimitCount = Number(process.env.REQ_RATE_LIMIT || 5);
    const clientKey = ipStr || sanitizedEmail || 'unknown';
    if (await rateLimiter.isRateLimited(clientKey, rateLimitCount)) {
      const resetAt = await rateLimiter.getResetAt(clientKey);
      res.status(429).json({ ok: false, error: 'Too many submissions from this client. Please try again later.', resetAt });
      return;
    }
    // DB fallback
    if (ipStr) {
      const recentCount = await db.query<{ count: number }>('SELECT COUNT(*) as count FROM testimonials WHERE request_ip = $1 AND created_at > (NOW() - INTERVAL \'1 hour\')', [ipStr]);
      const count = Number(recentCount[0]?.count || 0);
      if (count >= rateLimitCount) {
        res.status(429).json({ ok: false, error: 'Too many submissions from this IP. Please try again later.' });
        return;
      }
    }

    // Optional reCAPTCHA verification. In production, set RECAPTCHA_REQUIRED=true to enforce it.
    if (process.env.RECAPTCHA_SECRET) {
      if (process.env.RECAPTCHA_REQUIRED === 'true' && !recaptchaToken) {
        res.status(400).json({ ok: false, error: 'reCAPTCHA token required' });
        return;
      }
      if (!recaptchaToken) {
        // Not provided and not required
      } else {
        try {
          const verification = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET, response: String(recaptchaToken) }),
        }).then(r => r.json());
        if (!verification.success) {
          res.status(400).json({ ok: false, error: 'reCAPTCHA verification failed' });
          return;
        }
        } catch (e) {
          console.warn('reCAPTCHA verification error:', e);
        }
      }
    }

    const result = await db.query(
      `INSERT INTO testimonials (name, role, email, quote, anonymized, verified, metadata, request_ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [sanitizedName, sanitizedRole, sanitizedEmail, quote, isAnonymized, false, null, ipStr]
    );

    // Notify admin via Slack if configured
    if (process.env.ADMIN_SLACK_WEBHOOK) {
      try {
        const text = `New testimonial submitted: ${isAnonymized ? '(anonymous)' : sanitizedName || 'anonymous'} - ${quote.substring(0, 180)}`;
        await fetch(process.env.ADMIN_SLACK_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
      } catch (e) {
        console.warn('Failed to notify Slack', e);
      }
    }

    // increment rate limiter after successful insert (async-capable limiter)
    await rateLimiter.increment(clientKey, rateLimitCount, rateLimitWindowMs);
    res.status(201).json({ ok: true, created: result[0] });
  } catch (err) {
    console.error('Testimonial submission error:', err);
      try {
        if (process.env.ADMIN_SLACK_WEBHOOK) {
          await fetch(process.env.ADMIN_SLACK_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `Fatal error in submissions API: ${String(err)}` }) });
        }
      } catch (e) { console.warn('Slack notify failed', e); }
      res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

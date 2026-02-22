import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import { db } from '../../src/lib/database';
import { z } from 'zod';
import { enforceRateLimit, getClientIp, logError, logWarn, parseBodyWithZod } from '../../api-lib/http';

const TestimonialRequestSchema = z
  .object({
    name: z.string().max(255).optional(),
    role: z.string().max(255).optional(),
    email: z.string().email().max(320).optional(),
    quote: z.string().min(1).max(10_000),
    anonymized: z.boolean().optional(),
    consent: z.boolean(),
    recaptchaToken: z.string().max(4096).optional(),
  })
  .strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const parsed = parseBodyWithZod<{ 
      name?: string;
      role?: string;
      email?: string;
      quote: string;
      anonymized?: boolean;
      consent: boolean;
      recaptchaToken?: string;
    }>(TestimonialRequestSchema, req.body ?? {});

    if (!parsed.ok) {
      res.status(400).json({ ok: false, error: 'Invalid request body' });
      return;
    }

    const { name, role, email, quote, anonymized, consent, recaptchaToken } = parsed.data;

    const ipStr = getClientIp(req);
    const rateLimitWindowMs = Number(process.env.REQ_RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000);
    const rateLimitCount = Number(process.env.REQ_RATE_LIMIT || 5);
    const limitedOk = await enforceRateLimit({
      req,
      res,
      key: `ip:${ipStr}:landing:testimonial`,
      limit: rateLimitCount,
      windowMs: rateLimitWindowMs,
    });
    if (!limitedOk) return;

    // Basic validation
    const normalizedQuote = quote.trim();
    if (!normalizedQuote) {
      res.status(400).json({ error: 'Quote is required' });
      return;
    }

    const normalizeOptionalField = (value: string | undefined): string | null => {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      if (!trimmed) return null;
      if (trimmed.length > 255) return null;
      return trimmed;
    };

    // Consent required
    if (!consent) {
      res.status(400).json({ error: 'Consent is required to submit a testimonial' });
      return;
    }

    const isAnonymized = !!anonymized;
    const sanitizedName = isAnonymized ? null : normalizeOptionalField(name);
    const sanitizedRole = normalizeOptionalField(role);
    const sanitizedEmail = normalizeOptionalField(email);

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
          logWarn('reCAPTCHA verification error:', e);
        }
      }
    }

    const result = await db.query(
      `INSERT INTO testimonials (name, role, email, quote, anonymized, verified, metadata, request_ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [sanitizedName, sanitizedRole, sanitizedEmail, normalizedQuote, isAnonymized, false, null, ipStr]
    );

    // Notify admin via Slack if configured
    if (process.env.ADMIN_SLACK_WEBHOOK) {
      try {
        // Metadata-only: do NOT forward user-provided strings (quote/name/email/role) to Slack.
        const createdId = (result?.[0] as { id?: unknown } | undefined)?.id;
        const quoteChars = normalizedQuote.length;
        const hasEmail = Boolean(sanitizedEmail);
        const hasRole = Boolean(sanitizedRole);

        const text = [
          'New testimonial submitted',
          createdId ? `id=${String(createdId)}` : undefined,
          `anonymized=${String(isAnonymized)}`,
          `hasEmail=${String(hasEmail)}`,
          `hasRole=${String(hasRole)}`,
          `quoteChars=${String(quoteChars)}`,
        ]
          .filter(Boolean)
          .join(' | ');

        await fetch(process.env.ADMIN_SLACK_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
      } catch (e) {
        logWarn('Failed to notify Slack', e);
      }
    }
    res.status(201).json({ ok: true });
  } catch (err) {
    logError('Testimonial submission error:', err);
      try {
        if (process.env.ADMIN_SLACK_WEBHOOK) {
          // Avoid forwarding raw error strings to Slack (they may include sensitive data).
          await fetch(process.env.ADMIN_SLACK_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'Fatal error in submissions API: /api/landing/testimonial' }),
          });
        }
      } catch (e) { logWarn('Slack notify failed', e); }
      res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

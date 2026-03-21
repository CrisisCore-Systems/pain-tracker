import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import { db } from '../../src/lib/database';
import { z } from 'zod';
import { enforceRateLimit, getClientIp, logError, logWarn, parseBodyWithZod } from '../../api-lib/http';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TestimonialRequestSchema = z
  .object({
    name: z.string().max(255).optional(),
    role: z.string().max(255).optional(),
    email: z.string().max(320).optional(),
    quote: z.string().min(1).max(10_000),
    anonymized: z.boolean().optional(),
    consent: z.boolean(),
    recaptchaToken: z.string().max(4096).optional(),
  })
  .strict();

type ParsedTestimonialRequest = {
  name?: string;
  role?: string;
  email?: string;
  quote: string;
  anonymized?: boolean;
  consent: boolean;
  recaptchaToken?: string;
};

function normalizeOptionalField(value: string | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 255) return null;
  return trimmed;
}

async function verifyRecaptchaToken(recaptchaToken?: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.RECAPTCHA_SECRET) return { ok: true };

  if (process.env.RECAPTCHA_REQUIRED === 'true' && !recaptchaToken) {
    return { ok: false, error: 'reCAPTCHA token required' };
  }

  if (!recaptchaToken) return { ok: true };

  try {
    const verification = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET,
        response: String(recaptchaToken),
      }),
    }).then(r => r.json());

    if (!verification.success) {
      return { ok: false, error: 'reCAPTCHA verification failed' };
    }
  } catch (error) {
    logWarn('reCAPTCHA verification error:', error);
  }

  return { ok: true };
}

async function notifyTestimonialSlack(params: {
  normalizedQuote: string;
  isAnonymized: boolean;
  sanitizedEmail: string | null;
  sanitizedRole: string | null;
}): Promise<void> {
  if (!process.env.ADMIN_SLACK_WEBHOOK) return;

  const { normalizedQuote, isAnonymized, sanitizedEmail, sanitizedRole } = params;
  const text = [
    'New testimonial submitted',
    `anonymized=${String(isAnonymized)}`,
    `hasEmail=${String(Boolean(sanitizedEmail))}`,
    `hasRole=${String(Boolean(sanitizedRole))}`,
    `quoteChars=${String(normalizedQuote.length)}`,
  ].join(' | ');

  try {
    await fetch(process.env.ADMIN_SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    logWarn('Failed to notify Slack', error);
  }
}

async function notifyFatalSlack(): Promise<void> {
  if (!process.env.ADMIN_SLACK_WEBHOOK) return;

  try {
    await fetch(process.env.ADMIN_SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Fatal error in submissions API: /api/landing/testimonial' }),
    });
  } catch (error) {
    logWarn('Slack notify failed', error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const parsed = parseBodyWithZod<ParsedTestimonialRequest>(TestimonialRequestSchema, req.body ?? {});

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

    // Consent required
    if (!consent) {
      res.status(400).json({ error: 'Consent is required to submit a testimonial' });
      return;
    }

    const isAnonymized = !!anonymized;
    const sanitizedName = isAnonymized ? null : normalizeOptionalField(name);
    const sanitizedRole = normalizeOptionalField(role);
    const sanitizedEmail = normalizeOptionalField(email);

    if (sanitizedEmail && !EMAIL_REGEX.test(sanitizedEmail)) {
      res.status(400).json({ ok: false, error: 'Invalid email format' });
      return;
    }

    const recaptchaResult = await verifyRecaptchaToken(recaptchaToken);
    if (!recaptchaResult.ok) {
      res.status(400).json({ ok: false, error: recaptchaResult.error });
      return;
    }

    await db.query(
      `INSERT INTO testimonials (name, role, email, quote, anonymized, verified, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [sanitizedName, sanitizedRole, sanitizedEmail, normalizedQuote, isAnonymized, false, null]
    );

    await notifyTestimonialSlack({
      normalizedQuote,
      isAnonymized,
      sanitizedEmail,
      sanitizedRole,
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    logError('Testimonial submission error:', err);
    await notifyFatalSlack();
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

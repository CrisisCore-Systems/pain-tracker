import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import { db } from '../../src/lib/database.js';
import verifyAdmin from '../../api-lib/adminAuth.js';
import { z } from 'zod';
import {
  enforceRateLimit,
  getClientIp,
  logError,
  logWarn,
  parseBodyWithZod,
} from '../../api-lib/http.js';
import { validateCsrfForMutation } from '../../api-lib/csrf.js';

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

const TestimonialsQuerySchema = z
  .object({
    verified: z.enum(['true', 'false']).optional(),
  })
  .strict();

const VerifyBodySchema = z
  .object({
    id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).max(20)]),
    verified: z.boolean(),
    anonymized: z.boolean().optional(),
    publication_date: z.union([z.string().max(32), z.null()]).optional(),
  })
  .strict();

const IdSchema = z.union([z.number().int().positive(), z.string().regex(/^\d+$/).max(20)]);

const PatchSchema = z
  .object({
    anonymized: z.boolean().optional(),
    name: z.union([z.string().max(255), z.null()]).optional(),
    role: z.union([z.string().max(255), z.null()]).optional(),
    quote: z.string().max(10_000).optional(),
    publication_date: z.union([z.string().max(32), z.null()]).optional(),
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

type TestimonialVerifyBody = {
  id?: unknown;
  verified?: unknown;
  anonymized?: unknown;
  publication_date?: unknown;
};

type TestimonialPatchBody = {
  anonymized?: unknown;
  name?: unknown;
  role?: unknown;
  quote?: unknown;
  publication_date?: unknown;
};

type PatchData = z.infer<typeof PatchSchema>;

type BuildUpdateResult =
  | {
      ok: true;
      query: string;
      params: unknown[];
      auditDetails: {
        fields: string[];
        quoteChars?: number;
        hasName: boolean;
        hasRole: boolean;
      };
    }
  | { ok: false; status: 400; error: string };

function readRouteSegments(req: VercelRequest): string[] {
  const routeRaw = (req.query as { route?: string | string[] } | undefined)?.route;
  if (typeof routeRaw === 'string') return [routeRaw];
  if (Array.isArray(routeRaw) && routeRaw.length > 0) return routeRaw.filter(Boolean);

  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);
    const apiIndex = parts.indexOf('api');
    return apiIndex >= 0 ? parts.slice(apiIndex + 2) : parts;
  } catch {
    return [];
  }
}

function normalizeOptionalField(value: string | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 255) return null;
  return trimmed;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

function readTestimonialsQuery(req: VercelRequest) {
  const query = (req.query ?? {}) as Record<string, unknown>;
  const { route: _route, ...rest } = query;
  return rest;
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

function getAdminActor(req: VercelRequest): string {
  const actorRaw = req.headers['x-admin-user'] || 'admin';
  const actor = (Array.isArray(actorRaw) ? actorRaw[0] : String(actorRaw)).trim().slice(0, 64);
  return actor || 'admin';
}

function buildPatchUpdate(id: number, data: PatchData): BuildUpdateResult {
  const normalizedName = normalizeOptionalText(data.name);
  const normalizedRole = normalizeOptionalText(data.role);
  const normalizedQuote = typeof data.quote === 'string' ? data.quote.trim() : undefined;
  if (normalizedQuote !== undefined && !normalizedQuote) {
    return { ok: false, status: 400, error: 'Quote cannot be empty' };
  }

  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  const changedFields: string[] = [];

  if (data.anonymized !== undefined) {
    sets.push(`anonymized = $${idx++}`);
    params.push(!!data.anonymized);
    changedFields.push('anonymized');
  }
  if (data.name !== undefined) {
    sets.push(`name = $${idx++}`);
    params.push(normalizedName);
    changedFields.push('name');
  }
  if (data.role !== undefined) {
    sets.push(`role = $${idx++}`);
    params.push(normalizedRole);
    changedFields.push('role');
  }
  if (data.quote !== undefined) {
    sets.push(`quote = $${idx++}`);
    params.push(normalizedQuote);
    changedFields.push('quote');
  }
  if (data.publication_date !== undefined) {
    sets.push(`publication_date = $${idx++}`);
    params.push(data.publication_date);
    changedFields.push('publication_date');
  }

  if (sets.length === 0) {
    return { ok: false, status: 400, error: 'No changes provided' };
  }

  params.push(id);
  const query = `UPDATE testimonials SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;

  return {
    ok: true,
    query,
    params,
    auditDetails: {
      fields: changedFields,
      quoteChars: normalizedQuote ? normalizedQuote.length : undefined,
      hasName: normalizedName !== null,
      hasRole: normalizedRole !== null,
    },
  };
}

export async function handleTestimonialCreate(req: VercelRequest, res: VercelResponse) {
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

    const normalizedQuote = quote.trim();
    if (!normalizedQuote) {
      res.status(400).json({ error: 'Quote is required' });
      return;
    }

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

export async function handleTestimonialsList(req: VercelRequest, res: VercelResponse) {
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

    const auth = await verifyAdmin(req);
    if (!auth.ok) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    if (req.method === 'GET') {
      const q = TestimonialsQuerySchema.safeParse(readTestimonialsQuery(req));
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

export async function handleTestimonialsVerify(req: VercelRequest, res: VercelResponse) {
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

    const csrf = validateCsrfForMutation(req);
    if (!csrf.ok) {
      res.status(csrf.status).json({ ok: false, error: csrf.error });
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
    const verifiedByRaw = req.headers['x-admin-user'] || 'admin';
    const verifiedBy = Array.isArray(verifiedByRaw) ? verifiedByRaw[0] : String(verifiedByRaw);
    const safeActor = verifiedBy.trim().slice(0, 64) || 'admin';
    const verifiedAt = verified ? 'CURRENT_TIMESTAMP' : null;

    const q = `UPDATE testimonials SET verified = $1, anonymized = COALESCE($2, anonymized), verified_by = $3, verified_at = ${verifiedAt || 'NULL'}, publication_date = $4 WHERE id = $5 RETURNING *`;
    const params = [!!verified, anonymized ?? null, safeActor, publication_date ?? null, idValue];

    const result = await db.query(q, params);
    if (!result || result.length === 0) {
      res.status(404).json({ ok: false, error: 'Not found' });
      return;
    }

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

export async function handleTestimonialPatch(req: VercelRequest, res: VercelResponse, id: number) {
  const auth = await verifyAdmin(req);
  if (!auth.ok) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  const csrf = validateCsrfForMutation(req);
  if (!csrf.ok) {
    res.status(csrf.status).json({ ok: false, error: csrf.error });
    return;
  }

  const body = (req.body ?? {}) as TestimonialPatchBody;
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Invalid request body' });
    return;
  }

  const built = buildPatchUpdate(id, parsed.data);
  if (!built.ok) {
    res.status(built.status).json({ ok: false, error: built.error });
    return;
  }

  const result = await db.query(built.query, built.params);
  const actor = getAdminActor(req);

  await db.query(
    'INSERT INTO testimonials_audit (testimonial_id, action, actor, details) VALUES ($1, $2, $3, $4)',
    [id, 'update', actor, JSON.stringify(built.auditDetails)]
  );

  res.status(200).json({ ok: true, updated: result[0] });
}

async function handleTestimonialsById(req: VercelRequest, res: VercelResponse, idRaw: string) {
  try {
    const ip = getClientIp(req);
    const ok = await enforceRateLimit({
      req,
      res,
      key: `ip:${ip}:landing:testimonials:id`,
      limit: Number(process.env.ADMIN_RATE_LIMIT || 120),
      windowMs: Number(process.env.ADMIN_RATE_WINDOW_MS || 60 * 1000),
    });
    if (!ok) return;

    const idParsed = IdSchema.safeParse(idRaw);
    if (!idParsed.success) {
      res.status(400).json({ ok: false, error: 'Missing id' });
      return;
    }

    const id = typeof idParsed.data === 'string' ? Number(idParsed.data) : idParsed.data;

    if (req.method === 'PATCH') {
      await handleTestimonialPatch(req, res, id);
      return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    logError('Testimonials id endpoint error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const route = readRouteSegments(req);

  if (route.length === 1 && route[0] === 'testimonial') {
    await handleTestimonialCreate(req, res);
    return;
  }

  if (route.length === 1 && route[0] === 'testimonials') {
    await handleTestimonialsList(req, res);
    return;
  }

  if (route.length === 1 && route[0] === 'testimonials_verify') {
    await handleTestimonialsVerify(req, res);
    return;
  }

  if (route.length === 2 && route[0] === 'testimonials') {
    await handleTestimonialsById(req, res, route[1] || '');
    return;
  }

  res.status(404).json({ ok: false, error: 'Not found' });
}
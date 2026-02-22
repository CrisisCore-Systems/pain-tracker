import type { VercelRequest, VercelResponse } from '../../../src/types/vercel';
import { db } from '../../../src/lib/database';
import verifyAdmin from '../../../api-lib/adminAuth';
import { z } from 'zod';
import { enforceRateLimit, getClientIp, logError } from '../../../api-lib/http';

type TestimonialPatchBody = {
  anonymized?: unknown;
  name?: unknown;
  role?: unknown;
  quote?: unknown;
  publication_date?: unknown;
};

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

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

function getAdminActor(req: VercelRequest): string {
  const actorRaw = req.headers['x-admin-user'] || 'admin';
  const actor = (Array.isArray(actorRaw) ? actorRaw[0] : String(actorRaw)).trim().slice(0, 64);
  return actor || 'admin';
}

type PatchData = z.infer<typeof PatchSchema>;

type BuildUpdateResult =
  | {
      ok: true;
      query: string;
      params: unknown[];
      changedFields: string[];
      auditDetails: {
        fields: string[];
        quoteChars?: number;
        hasName: boolean;
        hasRole: boolean;
      };
    }
  | { ok: false; status: 400; error: string };

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
    changedFields,
    auditDetails: {
      fields: changedFields,
      quoteChars: normalizedQuote ? normalizedQuote.length : undefined,
      hasName: normalizedName !== null,
      hasRole: normalizedRole !== null,
    },
  };
}

async function handlePatch(req: VercelRequest, res: VercelResponse, id: number): Promise<void> {
  const auth = await verifyAdmin(req);
  if (!auth.ok) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const idRaw = (req.query as unknown as { id?: unknown } | undefined)?.id;
    const idValue = Array.isArray(idRaw) ? idRaw[0] : idRaw;
    const idParsed = IdSchema.safeParse(idValue);
    if (!idParsed.success) {
      res.status(400).json({ ok: false, error: 'Missing id' });
      return;
    }

    const id = typeof idParsed.data === 'string' ? Number(idParsed.data) : idParsed.data;

    if (req.method === 'PATCH') {
      await handlePatch(req, res, id);
      return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    logError('Testimonials id endpoint error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

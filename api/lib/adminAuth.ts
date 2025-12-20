import type { VercelRequest } from '../../src/types/vercel';

type VerifyAdminResult =
  | { ok: true; user?: unknown }
  | { ok: false; error: string };

function getInternalApiHost(req: VercelRequest): string {
  const configured = process.env.INTERNAL_API_HOST;
  if (configured) return configured;

  const protoRaw = req.headers['x-forwarded-proto'];
  const hostRaw = req.headers['host'];
  const proto = Array.isArray(protoRaw) ? protoRaw[0] : protoRaw;
  const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw;

  if (proto && host) return `${proto}://${host}`;
  if (host) return `https://${host}`;
  return 'http://localhost:3000';
}

export async function verifyAdmin(req: VercelRequest): Promise<VerifyAdminResult> {
  // Enforce bearer token validation via the internal clinic auth verify endpoint only.
  const authHeader = req.headers['authorization'];
  if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
    return { ok: false, error: 'Unauthorized' };
  }
  const token = String(authHeader).replace('Bearer ', '');
  try {
    const host = getInternalApiHost(req);
    const url = `${host}/api/clinic/auth/verify`;
    const resp = await fetch(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
    if (!resp.ok) return { ok: false, error: 'Invalid auth token' };
    const data = await resp.json();

    const user = (data as { user?: unknown } | null | undefined)?.user;
    const role =
      typeof user === 'object' && user !== null && 'role' in user
        ? (user as { role?: unknown }).role
        : undefined;

    if (role === 'admin') {
      return { ok: true, user };
    }
    return { ok: false, error: 'Not authorized' };
  } catch (e) {
    console.warn('Admin token verify error:', e);
    return { ok: false, error: 'Verification error' };
  }
}

export default verifyAdmin;

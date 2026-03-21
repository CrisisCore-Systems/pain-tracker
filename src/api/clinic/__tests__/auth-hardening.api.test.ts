import { afterEach, describe, expect, it, vi } from 'vitest';
import loginHandler from '../../../../api/clinic/auth/login';
import refreshHandler from '../../../../api/clinic/auth/refresh';
import logoutHandler from '../../../../api/clinic/auth/logout';
import verifyHandler from '../../../../api/clinic/auth/verify';

type MockRes = {
  _status: number;
  _body: unknown;
  status: (code: number) => MockRes;
  json: (payload: unknown) => MockRes;
  setHeader: (name: string, value: string | string[]) => void;
  getHeader: (name: string) => string | string[] | undefined;
};

function readSetCookie(res: MockRes): string[] {
  const raw = res.getHeader('set-cookie');
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function findCookie(setCookies: string[], cookieName: string): string | undefined {
  return setCookies.find(cookie => cookie.startsWith(`${cookieName}=`));
}

function extractCookieValue(setCookie: string): string {
  const firstPair = setCookie.split(';')[0] || '';
  const value = firstPair.split('=')[1] || '';
  return value.trim();
}

function createMockRes(): MockRes {
  const headers = new Map<string, string | string[]>();
  const res: MockRes = {
    _status: 200,
    _body: null,
    status: (code: number) => {
      res._status = code;
      return res;
    },
    json: (payload: unknown) => {
      res._body = payload;
      return res;
    },
    setHeader: (name: string, value: string | string[]) => {
      headers.set(name.toLowerCase(), value);
    },
    getHeader: (name: string) => headers.get(name.toLowerCase()),
  };
  return res;
}

describe('clinic auth hardening', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('fails closed for login when clinic auth secret is missing', async () => {
    delete process.env.CLINIC_AUTH_SECRET;
    process.env.ALLOW_DEMO_AUTH = 'true';
    process.env.NODE_ENV = 'development';
    const requestPassword = Math.random().toString(36).slice(2);

    const req = {
      method: 'POST',
      headers: {},
      body: { email: 'doctor@clinic.com', password: requestPassword },
    } as Parameters<typeof loginHandler>[0];
    const res = createMockRes();

    await loginHandler(req, res as unknown as Parameters<typeof loginHandler>[1]);

    expect(res._status).toBe(503);
    expect(res._body).toMatchObject({ code: 'CLINIC_AUTH_MISCONFIGURED' });
  });

  it('fails closed for verify when clinic auth secret is missing', async () => {
    delete process.env.CLINIC_AUTH_SECRET;

    const req = {
      method: 'GET',
      headers: {},
    } as Parameters<typeof verifyHandler>[0];
    const res = createMockRes();

    await verifyHandler(req, res as unknown as Parameters<typeof verifyHandler>[1]);

    expect(res._status).toBe(503);
    expect(res._body).toMatchObject({ code: 'CLINIC_AUTH_MISCONFIGURED', valid: false });
  });

  it('fails closed for refresh/logout when clinic auth secret is missing', async () => {
    delete process.env.CLINIC_AUTH_SECRET;

    const refreshReq = {
      method: 'POST',
      headers: {},
    } as Parameters<typeof refreshHandler>[0];
    const refreshRes = createMockRes();

    await refreshHandler(refreshReq, refreshRes as unknown as Parameters<typeof refreshHandler>[1]);

    expect(refreshRes._status).toBe(503);
    expect(refreshRes._body).toMatchObject({ code: 'CLINIC_AUTH_MISCONFIGURED' });

    const logoutReq = {
      method: 'POST',
      headers: {},
    } as Parameters<typeof logoutHandler>[0];
    const logoutRes = createMockRes();

    await logoutHandler(logoutReq, logoutRes as unknown as Parameters<typeof logoutHandler>[1]);

    expect(logoutRes._status).toBe(503);
    expect(logoutRes._body).toMatchObject({ code: 'CLINIC_AUTH_MISCONFIGURED' });
  });

  it('returns 401 from verify when no bearer token and no auth cookie are provided', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';

    const req = {
      method: 'GET',
      headers: {},
    } as Parameters<typeof verifyHandler>[0];
    const res = createMockRes();

    await verifyHandler(req, res as unknown as Parameters<typeof verifyHandler>[1]);

    expect(res._status).toBe(401);
    expect(res._body).toMatchObject({ valid: false, error: 'Unauthorized' });
  });

  it('sets hardened cookie attributes on login response', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';
    process.env.ALLOW_DEMO_AUTH = 'true';
    process.env.NODE_ENV = 'development';

    const req = {
      method: 'POST',
      headers: {
        host: 'example.test',
        'x-forwarded-proto': 'https',
      },
      body: { email: 'doctor@clinic.com', password: Math.random().toString(36).slice(2) },
    } as unknown as Parameters<typeof loginHandler>[0];
    const res = createMockRes();

    await loginHandler(req, res as unknown as Parameters<typeof loginHandler>[1]);

    expect(res._status).toBe(200);
    const setCookies = readSetCookie(res);
    const sessionCookie = findCookie(setCookies, 'clinic_session');
    const csrfCookie = findCookie(setCookies, 'csrfToken');

    expect(sessionCookie).toBeDefined();
    expect(csrfCookie).toBeDefined();
    expect(sessionCookie).toContain('Path=/');
    expect(sessionCookie).toContain('HttpOnly');
    expect(sessionCookie).toContain('SameSite=Strict');
    expect(sessionCookie).toContain('Secure');
    expect(sessionCookie).toContain('Max-Age=900');
    expect(csrfCookie).toContain('Path=/');
    expect(csrfCookie).toContain('SameSite=Strict');
    expect(csrfCookie).toContain('Secure');
    expect(csrfCookie).toContain('Max-Age=900');
  });

  it('refresh reissues session cookies with hardened attributes', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';
    process.env.ALLOW_DEMO_AUTH = 'true';
    process.env.NODE_ENV = 'development';

    const loginReq = {
      method: 'POST',
      headers: {
        host: 'example.test',
        'x-forwarded-proto': 'https',
      },
      body: { email: 'doctor@clinic.com', password: Math.random().toString(36).slice(2) },
    } as unknown as Parameters<typeof loginHandler>[0];
    const loginRes = createMockRes();
    await loginHandler(loginReq, loginRes as unknown as Parameters<typeof loginHandler>[1]);
    const initialSetCookies = readSetCookie(loginRes);

    const sessionCookieRaw = findCookie(initialSetCookies, 'clinic_session');
    const csrfCookieRaw = findCookie(initialSetCookies, 'csrfToken');
    expect(sessionCookieRaw).toBeDefined();
    expect(csrfCookieRaw).toBeDefined();

    const sessionValue = extractCookieValue(sessionCookieRaw || '');
    const csrfValue = extractCookieValue(csrfCookieRaw || '');
    const refreshReq = {
      method: 'POST',
      headers: {
        host: 'example.test',
        'x-forwarded-proto': 'https',
        origin: 'https://example.test',
        cookie: `clinic_session=${sessionValue}; csrfToken=${csrfValue}`,
        'x-csrf-token': csrfValue,
      },
    } as unknown as Parameters<typeof refreshHandler>[0];
    const refreshRes = createMockRes();

    await refreshHandler(refreshReq, refreshRes as unknown as Parameters<typeof refreshHandler>[1]);

    expect(refreshRes._status).toBe(200);
    const refreshSetCookies = readSetCookie(refreshRes);
    const refreshedSession = findCookie(refreshSetCookies, 'clinic_session');
    const refreshedCsrf = findCookie(refreshSetCookies, 'csrfToken');
    expect(refreshedSession).toContain('Path=/');
    expect(refreshedSession).toContain('HttpOnly');
    expect(refreshedSession).toContain('SameSite=Strict');
    expect(refreshedSession).toContain('Secure');
    expect(refreshedSession).toContain('Max-Age=900');
    expect(refreshedCsrf).toContain('Path=/');
    expect(refreshedCsrf).toContain('SameSite=Strict');
    expect(refreshedCsrf).toContain('Secure');
    expect(refreshedCsrf).toContain('Max-Age=900');
  });

  it('rejects refresh when csrf header is missing', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';

    const req = {
      method: 'POST',
      headers: {
        host: 'example.test',
        'x-forwarded-proto': 'https',
        origin: 'https://example.test',
        cookie: 'csrfToken=abc123',
      },
    } as unknown as Parameters<typeof refreshHandler>[0];
    const res = createMockRes();

    await refreshHandler(req, res as unknown as Parameters<typeof refreshHandler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Missing CSRF token' });
  });

  it('rejects refresh when csrf token mismatches cookie token', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';

    const req = {
      method: 'POST',
      headers: {
        host: 'example.test',
        'x-forwarded-proto': 'https',
        origin: 'https://example.test',
        cookie: 'csrfToken=abc123',
        'x-csrf-token': 'wrong-token',
      },
    } as unknown as Parameters<typeof refreshHandler>[0];
    const res = createMockRes();

    await refreshHandler(req, res as unknown as Parameters<typeof refreshHandler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Invalid CSRF token' });
  });

  it('rejects refresh when origin is absent', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';

    const req = {
      method: 'POST',
      headers: {
        host: 'example.test',
        'x-forwarded-proto': 'https',
        cookie: 'csrfToken=abc123',
        'x-csrf-token': 'abc123',
      },
    } as unknown as Parameters<typeof refreshHandler>[0];
    const res = createMockRes();

    await refreshHandler(req, res as unknown as Parameters<typeof refreshHandler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Invalid request origin' });
  });

  it('rejects refresh when auth cookie is absent', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';

    const req = {
      method: 'POST',
      headers: {
        host: 'example.test',
        'x-forwarded-proto': 'https',
        origin: 'https://example.test',
        cookie: 'csrfToken=abc123',
        'x-csrf-token': 'abc123',
      },
    } as unknown as Parameters<typeof refreshHandler>[0];
    const res = createMockRes();

    await refreshHandler(req, res as unknown as Parameters<typeof refreshHandler>[1]);

    expect(res._status).toBe(401);
    expect(res._body).toMatchObject({ error: 'Session expired' });
  });

  it('rejects logout when csrf header is missing', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';

    const req = {
      method: 'POST',
      headers: {
        host: 'example.test',
        'x-forwarded-proto': 'https',
        origin: 'https://example.test',
        cookie: 'csrfToken=abc123',
      },
    } as unknown as Parameters<typeof logoutHandler>[0];
    const res = createMockRes();

    await logoutHandler(req, res as unknown as Parameters<typeof logoutHandler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Missing CSRF token' });
  });

  it('rejects logout when csrf token mismatches cookie token', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';

    const req = {
      method: 'POST',
      headers: {
        host: 'example.test',
        'x-forwarded-proto': 'https',
        origin: 'https://example.test',
        cookie: 'csrfToken=abc123',
        'x-csrf-token': 'wrong-token',
      },
    } as unknown as Parameters<typeof logoutHandler>[0];
    const res = createMockRes();

    await logoutHandler(req, res as unknown as Parameters<typeof logoutHandler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Invalid CSRF token' });
  });

  it('rejects logout when origin is absent', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';

    const req = {
      method: 'POST',
      headers: {
        host: 'example.test',
        'x-forwarded-proto': 'https',
        cookie: 'csrfToken=abc123',
        'x-csrf-token': 'abc123',
      },
    } as unknown as Parameters<typeof logoutHandler>[0];
    const res = createMockRes();

    await logoutHandler(req, res as unknown as Parameters<typeof logoutHandler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Invalid request origin' });
  });

  it('blocks demo auth when ALLOW_DEMO_AUTH is not explicitly true', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';
    process.env.ALLOW_DEMO_AUTH = 'false';
    process.env.NODE_ENV = 'development';
    const requestPassword = Math.random().toString(36).slice(2);

    const req = {
      method: 'POST',
      headers: {},
      body: { email: 'doctor@clinic.com', password: requestPassword },
    } as Parameters<typeof loginHandler>[0];
    const res = createMockRes();

    await loginHandler(req, res as unknown as Parameters<typeof loginHandler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ code: 'DEMO_AUTH_DISABLED' });
  });

  it('blocks demo auth in production even when ALLOW_DEMO_AUTH is true', async () => {
    process.env.CLINIC_AUTH_SECRET = 'test-secret';
    process.env.ALLOW_DEMO_AUTH = 'true';
    process.env.NODE_ENV = 'production';
    const requestPassword = Math.random().toString(36).slice(2);

    const req = {
      method: 'POST',
      headers: {},
      body: { email: 'doctor@clinic.com', password: requestPassword },
    } as Parameters<typeof loginHandler>[0];
    const res = createMockRes();

    await loginHandler(req, res as unknown as Parameters<typeof loginHandler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ code: 'DEMO_AUTH_DISABLED' });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../../../api/weather';

type MockReq = {
  method: string;
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string | undefined>;
  url?: string;
};

type MockRes = {
  _status: number;
  _body: unknown;
  _headers: Record<string, string>;
  status: (code: number) => MockRes;
  json: (payload: unknown) => MockRes;
  setHeader: (name: string, value: string) => MockRes;
};

function makeReq(query: Record<string, string | undefined>, method = 'GET', ip = '100.10.10.1'): MockReq {
  return {
    method,
    query,
    headers: {
      'x-forwarded-for': ip,
      'x-real-ip': '203.0.113.10',
      cookie: 'session=sensitive',
      authorization: 'Bearer secret',
    },
  };
}

function createMockRes(): MockRes {
  const res: MockRes = {
    _status: 200,
    _body: null,
    _headers: {},
    status(code: number) {
      this._status = code;
      return this;
    },
    json(payload: unknown) {
      this._body = payload;
      return this;
    },
    setHeader(name: string, value: string) {
      this._headers[name.toLowerCase()] = value;
      return this;
    },
  };
  return res;
}

describe('GET /api/weather privacy proxy', () => {
  beforeEach(() => {
    process.env.WEATHER_RATE_LIMIT = '1000';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.WEATHER_RATE_LIMIT;
  });

  it('rejects non-GET methods', async () => {
    const req = makeReq({ latitude: '49.28', longitude: '-123.12' }, 'POST');
    const res = createMockRes();

    await handler(req as never, res as never);

    expect(res._status).toBe(405);
    expect(res._body).toMatchObject({ ok: false, error: 'Method not allowed' });
  });

  it('rejects overly precise coordinates', async () => {
    const req = makeReq({ latitude: '49.2827', longitude: '-123.12' });
    const res = createMockRes();

    await handler(req as never, res as never);

    expect(res._status).toBe(400);
    expect(res._body).toMatchObject({
      ok: false,
      error: 'latitude must be rounded to at most 2 decimal places',
    });
  });

  it('rejects out-of-range coordinates', async () => {
    const req = makeReq({ latitude: '91', longitude: '-123.12' });
    const res = createMockRes();

    await handler(req as never, res as never);

    expect(res._status).toBe(400);
    expect(res._body).toMatchObject({ ok: false, error: 'latitude is out of range' });
  });

  it('proxies with allowlisted params and strips identifying inbound headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        latitude: 49.28,
        longitude: -123.12,
        current: {
          temperature_2m: 19.3,
          relative_humidity_2m: 62,
          weather_code: 2,
          pressure_msl: 1013.7,
        },
        hourly: { temperature_2m: [1, 2, 3] },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const req = makeReq({ latitude: '49.28', longitude: '-123.12' });
    const res = createMockRes();

    await handler(req as never, res as never);

    expect(res._status).toBe(200);
    expect(res._headers['cache-control']).toBe('no-store');
    expect(res._body).toEqual({
      current: {
        temperature_2m: 19.3,
        relative_humidity_2m: 62,
        weather_code: 2,
        pressure_msl: 1013.7,
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://api.open-meteo.com');
    expect(parsed.pathname).toBe('/v1/forecast');
    expect(parsed.searchParams.get('latitude')).toBe('49.28');
    expect(parsed.searchParams.get('longitude')).toBe('-123.12');
    expect(parsed.searchParams.get('current')).toBe(
      'temperature_2m,relative_humidity_2m,weather_code,pressure_msl'
    );
    expect(parsed.searchParams.get('timezone')).toBe('auto');

    const headers = (init.headers || {}) as Record<string, string>;
    expect(headers).toEqual({ Accept: 'application/json' });
  });

  it('returns 502 when upstream fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('upstream failure')));

    const req = makeReq({ latitude: '49.28', longitude: '-123.12' });
    const res = createMockRes();

    await handler(req as never, res as never);

    expect(res._status).toBe(502);
    expect(res._body).toMatchObject({ ok: false, error: 'Weather upstream unavailable' });
  });
});

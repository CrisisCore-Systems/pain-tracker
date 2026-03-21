import type { VercelRequest, VercelResponse } from '../src/types/vercel';
import { enforceRateLimit, getClientIp, logError } from '../api-lib/http';

const WEATHER_UPSTREAM = 'https://api.open-meteo.com/v1/forecast';
const ALLOWED_CURRENT = 'temperature_2m,relative_humidity_2m,weather_code,pressure_msl';

type CoordinateParseResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

type WeatherUpstreamResponse = {
  current?: {
    temperature_2m?: number | null;
    relative_humidity_2m?: number | null;
    weather_code?: number | null;
    pressure_msl?: number | null;
  };
};

function readQueryParam(req: VercelRequest, key: string): string | null {
  const fromQuery = req.query?.[key];
  if (typeof fromQuery === 'string') return fromQuery;
  if (Array.isArray(fromQuery) && fromQuery.length > 0) return fromQuery[0] ?? null;

  try {
    const url = new URL(req.url || '/', 'http://localhost');
    return url.searchParams.get(key);
  } catch {
    return null;
  }
}

function parseCoordinate(name: 'latitude' | 'longitude', raw: string | null): CoordinateParseResult {
  if (!raw || raw.trim().length === 0) {
    return { ok: false, error: `Missing ${name}` };
  }

  const normalized = raw.trim();
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return { ok: false, error: `${name} must be rounded to at most 2 decimal places` };
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    return { ok: false, error: `${name} must be a valid number` };
  }

  const min = name === 'latitude' ? -90 : -180;
  const max = name === 'latitude' ? 90 : 180;
  if (value < min || value > max) {
    return { ok: false, error: `${name} is out of range` };
  }

  return { ok: true, value };
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

function sanitizeWeatherPayload(payload: unknown): WeatherUpstreamResponse {
  const current =
    typeof payload === 'object' && payload !== null && 'current' in payload
      ? (payload as { current?: Record<string, unknown> }).current
      : undefined;

  return {
    current: {
      temperature_2m: toNumberOrNull(current?.temperature_2m),
      relative_humidity_2m: toNumberOrNull(current?.relative_humidity_2m),
      weather_code: toNumberOrNull(current?.weather_code),
      pressure_msl: toNumberOrNull(current?.pressure_msl),
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const ip = getClientIp(req);
  const withinRateLimit = await enforceRateLimit({
    req,
    res,
    key: `ip:${ip}:weather`,
    limit: Number(process.env.WEATHER_RATE_LIMIT || 120),
    windowMs: Number(process.env.WEATHER_WINDOW_MS || 60 * 1000),
  });
  if (!withinRateLimit) return;

  const latitude = parseCoordinate('latitude', readQueryParam(req, 'latitude'));
  if (!latitude.ok) {
    res.status(400).json({ ok: false, error: latitude.error });
    return;
  }

  const longitude = parseCoordinate('longitude', readQueryParam(req, 'longitude'));
  if (!longitude.ok) {
    res.status(400).json({ ok: false, error: longitude.error });
    return;
  }

  const upstream = new URL(WEATHER_UPSTREAM);
  upstream.searchParams.set('latitude', latitude.value.toFixed(2));
  upstream.searchParams.set('longitude', longitude.value.toFixed(2));
  upstream.searchParams.set('current', ALLOWED_CURRENT);
  upstream.searchParams.set('timezone', 'auto');

  try {
    // Do not forward inbound identifying headers; fetch uses an explicit minimal header set.
    const upstreamResp = await fetch(upstream.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!upstreamResp.ok) {
      res.status(502).json({ ok: false, error: 'Weather upstream unavailable' });
      return;
    }

    const payload = await upstreamResp.json();
    const sanitized = sanitizeWeatherPayload(payload);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(sanitized);
  } catch (error) {
    logError('[api/weather] upstream request failed', error);
    res.status(502).json({ ok: false, error: 'Weather upstream unavailable' });
  }
}

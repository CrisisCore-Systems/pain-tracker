import { interpretWeatherCode } from '@pain-tracker/services/weatherCodes';
import type { WeatherData } from '@pain-tracker/services/weather';

// Lightweight weather service to fetch weather data from Open-Meteo (free, no API key required)
export type { WeatherData } from '@pain-tracker/services/weather';

type WeatherApiCurrent = {
  temperature_2m?: number | null;
  relative_humidity_2m?: number | null;
  weather_code?: number | null;
  pressure_msl?: number | null;
};

type WeatherApiResponse = {
  current?: WeatherApiCurrent;
};

function roundCoordinate(value: number): number {
  // Reduce precision before network egress to avoid transmitting exact coordinates.
  return Math.round(value * 100) / 100;
}

function buildWeatherUrl(lat: number, lon: number): string {
  const roundedLat = roundCoordinate(lat);
  const roundedLon = roundCoordinate(lon);
  return `/api/weather?latitude=${roundedLat}&longitude=${roundedLon}&current=temperature_2m,relative_humidity_2m,weather_code,pressure_msl&timezone=auto`;
}

function parseWeatherResponse(data: WeatherApiResponse): WeatherData | null {
  const current = data?.current;
  if (!current) return null;

  const weatherCode = current.weather_code ?? null;
  const { condition, isRaining } = interpretWeatherCode(weatherCode);

  return {
    temperature: current.temperature_2m ?? null,
    condition,
    pressure: current.pressure_msl ?? null,
    humidity: current.relative_humidity_2m ?? null,
    isRaining,
    weatherCode,
  };
}

function maybeLogNonOkResponse(resp: Response): void {
  if (!(import.meta.env.DEV && !import.meta.env.VITEST)) return;
  const status = typeof resp.status === 'number' ? resp.status : undefined;
  if (typeof status !== 'number') return;
  console.debug('weather: /api/weather non-OK', {
    status,
    statusText: typeof resp.statusText === 'string' ? resp.statusText : undefined,
  });
}

function maybeLogFetchError(error: unknown): void {
  if (!(import.meta.env.DEV && !import.meta.env.VITEST)) return;
  const err = error as Partial<Error>;
  console.debug('weather: fetch failed', {
    name: typeof err.name === 'string' ? err.name : undefined,
    message: typeof err.message === 'string' ? err.message : undefined,
  });
}

/**
 * Fetch comprehensive weather data for a location
 * Uses Open-Meteo's free API (no key required)
 */
export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    // Request current weather data including temperature, humidity, pressure, and weather code
    // Use same-origin endpoint to comply with strict CSP (connect-src 'self').
    // In dev, Vite proxies /api/weather to Open-Meteo. In production, Vercel rewrites it.
    const url = buildWeatherUrl(lat, lon);
    const resp = await fetch(url, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
    });
    if (!resp.ok) {
      maybeLogNonOkResponse(resp);
      return null;
    }

    const data = (await resp.json()) as WeatherApiResponse;
    return parseWeatherResponse(data);
  } catch (e) {
    maybeLogFetchError(e);
    return null;
  }
}

/**
 * Legacy function - fetch only barometric pressure
 * @deprecated Use fetchWeatherData instead for full weather info
 */
export async function fetchBarometricPressure(lat: number, lon: number): Promise<number | null> {
  const weather = await fetchWeatherData(lat, lon);
  return weather?.pressure ?? null;
}

/**
 * Format weather data into a human-readable summary
 */
export function formatWeatherSummary(weather: WeatherData): string {
  const parts: string[] = [];
  
  if (weather.temperature !== null) {
    parts.push(`${Math.round(weather.temperature)}°C`);
  }
  
  if (weather.condition) {
    parts.push(weather.condition);
  }
  
  if (weather.humidity !== null) {
    parts.push(`${weather.humidity}% humidity`);
  }
  
  return parts.join(', ') || 'Weather data unavailable';
}

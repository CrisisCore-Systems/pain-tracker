import { fetchWeatherData } from './weather';
import type { WeatherData } from './weather';
import { readPrivacySettings } from '../utils/privacySettings';

export type CapturedWeather = {
  summary: string;
  weather: WeatherData;
};

export function formatWeatherSummaryForEntry(weather: WeatherData): string {
  const parts: string[] = [];

  if (weather.temperature !== null) {
    parts.push(`${Math.round(weather.temperature)}°C`);
  }

  if (weather.condition) {
    parts.push(weather.condition);
  }

  if (weather.isRaining) {
    parts.push('🌧️');
  }

  if (weather.humidity !== null) {
    parts.push(`${weather.humidity}% humidity`);
  }

  return parts.join(', ');
}

export async function maybeCaptureWeatherForNewEntry(): Promise<CapturedWeather | null> {
  const { weatherAutoCapture } = readPrivacySettings();
  if (!weatherAutoCapture) return null;

  if (typeof navigator === 'undefined') return null;
  if (!('geolocation' in navigator) || !navigator.geolocation) return null;

  try {
    // Note: permission prompts can easily exceed a short timeout; keep this generous.
    // This is best-effort and runs asynchronously (never blocks saving).
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 10 * 60 * 1000,
      })
    );

    const weather = await fetchWeatherData(pos.coords.latitude, pos.coords.longitude);
    if (!weather) return null;

    const summary = formatWeatherSummaryForEntry(weather);
    if (!summary) return null;

    return { summary, weather };
  } catch (err) {
    // Best-effort only; never block entry creation
    if (import.meta.env.DEV && !import.meta.env.VITEST) {
      // Do not log coordinates/URLs; keep errors non-reconstructive.
      const geoErr = err as Partial<GeolocationPositionError>;
      console.debug('weatherAutoCapture: failed', {
        code: typeof geoErr.code === 'number' ? geoErr.code : undefined,
        name: typeof (err as Error)?.name === 'string' ? (err as Error).name : undefined,
      });
    }
    return null;
  }
}

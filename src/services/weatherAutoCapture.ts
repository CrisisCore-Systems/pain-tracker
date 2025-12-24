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
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
    );

    const weather = await fetchWeatherData(pos.coords.latitude, pos.coords.longitude);
    if (!weather) return null;

    const summary = formatWeatherSummaryForEntry(weather);
    if (!summary) return null;

    return { summary, weather };
  } catch {
    // Best-effort only; never block entry creation
    return null;
  }
}

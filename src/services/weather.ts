import { interpretWeatherCode } from '@pain-tracker/services/weatherCodes';
import type { WeatherData } from '@pain-tracker/services/weather';

// Lightweight weather service to fetch weather data from Open-Meteo (free, no API key required)
export type { WeatherData };

/**
 * Fetch comprehensive weather data for a location
 * Uses Open-Meteo's free API (no key required)
 */
export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    // Request current weather data including temperature, humidity, pressure, and weather code
    // Use same-origin endpoint to comply with strict CSP (connect-src 'self').
    // In dev, Vite proxies /api/weather to Open-Meteo. In production, Vercel rewrites it.
    const url = `/api/weather?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,pressure_msl&timezone=auto`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    
    const data = await resp.json();
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
  } catch (e) {
    console.debug('weather: fetch failed', e);
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

import { interpretWeatherCode } from './weatherCodes';

export interface WeatherData {
  temperature: number | null; // Celsius
  condition: string | null; // 'clear', 'cloudy', 'rain', 'snow', etc.
  pressure: number | null; // hPa (barometric pressure)
  humidity: number | null; // Percentage
  isRaining: boolean;
  weatherCode: number | null; // WMO weather code
}

export interface LocalWeatherResult {
  temp: number | null;
  condition: string | null;
  pressure: number | null;
  humidity: number | null;
  isRaining: boolean;
}

const EMPTY_LOCAL_WEATHER: LocalWeatherResult = {
  temp: null,
  condition: null,
  pressure: null,
  humidity: null,
  isRaining: false,
};

/**
 * Fetch local weather data with coordinates
 * Falls back to safe defaults if fetch fails (never blocks user operations)
 */
export async function fetchLocalWeather(coords?: { lat: number; lon: number }): Promise<LocalWeatherResult> {
  // If no coordinates provided, return null values (safe fallback)
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lon !== 'number') {
    return EMPTY_LOCAL_WEATHER;
  }

  try {
    const weather = await fetchWeatherData(coords.lat, coords.lon);
    if (!weather) return EMPTY_LOCAL_WEATHER;

    return {
      temp: weather.temperature,
      condition: weather.condition,
      pressure: weather.pressure,
      humidity: weather.humidity,
      isRaining: weather.isRaining,
    };
  } catch (e) {
    console.debug('fetchLocalWeather: fetch failed', e);
    return EMPTY_LOCAL_WEATHER;
  }
}

/**
 * Fetch comprehensive weather data for a location
 * Uses Open-Meteo's free API (no key required)
 */
export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,pressure_msl&timezone=auto`;
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

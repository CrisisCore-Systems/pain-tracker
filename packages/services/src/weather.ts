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

/**
 * Fetch local weather data with coordinates
 * Falls back to safe defaults if fetch fails (never blocks user operations)
 */
export async function fetchLocalWeather(coords?: { lat: number; lon: number }): Promise<LocalWeatherResult> {
  // If no coordinates provided, return null values (safe fallback)
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lon !== 'number') {
    return { temp: null, condition: null, pressure: null, humidity: null, isRaining: false };
  }

  try {
    // Use Open-Meteo's free API (no key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,pressure_msl&timezone=auto`;
    
    const resp = await fetch(url);
    if (!resp.ok) {
      return { temp: null, condition: null, pressure: null, humidity: null, isRaining: false };
    }
    
    const data = await resp.json();
    const current = data?.current;
    
    if (!current) {
      return { temp: null, condition: null, pressure: null, humidity: null, isRaining: false };
    }
    
    const weatherCode = current.weather_code ?? null;
    const { condition, isRaining } = interpretWeatherCode(weatherCode);
    
    return {
      temp: current.temperature_2m ?? null,
      condition,
      pressure: current.pressure_msl ?? null,
      humidity: current.relative_humidity_2m ?? null,
      isRaining,
    };
  } catch (e) {
    console.debug('fetchLocalWeather: fetch failed', e);
    return { temp: null, condition: null, pressure: null, humidity: null, isRaining: false };
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

// WMO Weather interpretation codes mapping
const WEATHER_CODE_MAP: Record<number, { condition: string; isRaining: boolean }> = {
  0: { condition: 'clear', isRaining: false },
  1: { condition: 'mostly clear', isRaining: false },
  2: { condition: 'partly cloudy', isRaining: false },
  3: { condition: 'overcast', isRaining: false },
  45: { condition: 'foggy', isRaining: false },
  48: { condition: 'foggy', isRaining: false },
  51: { condition: 'light drizzle', isRaining: true },
  53: { condition: 'drizzle', isRaining: true },
  55: { condition: 'heavy drizzle', isRaining: true },
  56: { condition: 'freezing drizzle', isRaining: true },
  57: { condition: 'freezing drizzle', isRaining: true },
  61: { condition: 'light rain', isRaining: true },
  63: { condition: 'rain', isRaining: true },
  65: { condition: 'heavy rain', isRaining: true },
  66: { condition: 'freezing rain', isRaining: true },
  67: { condition: 'freezing rain', isRaining: true },
  71: { condition: 'light snow', isRaining: false },
  73: { condition: 'snow', isRaining: false },
  75: { condition: 'heavy snow', isRaining: false },
  77: { condition: 'snow grains', isRaining: false },
  80: { condition: 'light showers', isRaining: true },
  81: { condition: 'showers', isRaining: true },
  82: { condition: 'heavy showers', isRaining: true },
  85: { condition: 'light snow showers', isRaining: false },
  86: { condition: 'snow showers', isRaining: false },
  95: { condition: 'thunderstorm', isRaining: true },
  96: { condition: 'thunderstorm with hail', isRaining: true },
  99: { condition: 'thunderstorm with heavy hail', isRaining: true },
};

function interpretWeatherCode(code: number | null): { condition: string | null; isRaining: boolean } {
  if (code === null) return { condition: null, isRaining: false };
  return WEATHER_CODE_MAP[code] ?? { condition: 'unknown', isRaining: false };
}

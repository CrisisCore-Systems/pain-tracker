// Lightweight weather service to fetch weather data from Open-Meteo (free, no API key required)

export interface WeatherData {
  temperature: number | null;      // Celsius
  condition: string | null;        // 'clear', 'cloudy', 'rain', 'snow', etc.
  pressure: number | null;         // hPa (barometric pressure)
  humidity: number | null;         // Percentage
  isRaining: boolean;
  weatherCode: number | null;      // WMO weather code
}

// WMO Weather interpretation codes mapping
// See: https://open-meteo.com/en/docs#weathervariables
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

/**
 * Fetch comprehensive weather data for a location
 * Uses Open-Meteo's free API (no key required)
 */
export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    // Request current weather data including temperature, humidity, pressure, and weather code
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

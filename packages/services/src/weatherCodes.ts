// Shared weather code interpretation utilities
export const WEATHER_CODE_MAP: Record<number, { condition: string; isRaining: boolean }> = {
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

export function interpretWeatherCode(code: number | null): { condition: string | null; isRaining: boolean } {
  if (code === null) return { condition: null, isRaining: false };
  return WEATHER_CODE_MAP[code] ?? { condition: 'unknown', isRaining: false };
}

export interface WeatherData {
    temperature: number | null;
    condition: string | null;
    pressure: number | null;
    humidity: number | null;
    isRaining: boolean;
    weatherCode: number | null;
}
/**
 * Fetch comprehensive weather data for a location
 * Uses Open-Meteo's free API (no key required)
 */
export declare function fetchWeatherData(lat: number, lon: number): Promise<WeatherData | null>;
/**
 * Legacy function - fetch only barometric pressure
 * @deprecated Use fetchWeatherData instead for full weather info
 */
export declare function fetchBarometricPressure(lat: number, lon: number): Promise<number | null>;
/**
 * Format weather data into a human-readable summary
 */
export declare function formatWeatherSummary(weather: WeatherData): string;

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWeatherData, fetchBarometricPressure, formatWeatherSummary, type WeatherData } from '../weather';

describe('Weather Service', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('fetchWeatherData', () => {
    it('should fetch and parse weather data correctly', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 18.5,
          relative_humidity_2m: 65,
          weather_code: 3,
          pressure_msl: 1015.2,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchWeatherData(49.2827, -123.1207);

      expect(result).toEqual({
        temperature: 18.5,
        condition: 'overcast',
        pressure: 1015.2,
        humidity: 65,
        isRaining: false,
        weatherCode: 3,
      });
    });

    it('should detect rain conditions correctly', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 12,
          relative_humidity_2m: 85,
          weather_code: 63, // rain
          pressure_msl: 1008,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchWeatherData(49.2827, -123.1207);

      expect(result?.isRaining).toBe(true);
      expect(result?.condition).toBe('rain');
    });

    it('should detect drizzle as rain', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 10,
          relative_humidity_2m: 90,
          weather_code: 51, // light drizzle
          pressure_msl: 1005,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchWeatherData(49.2827, -123.1207);

      expect(result?.isRaining).toBe(true);
      expect(result?.condition).toBe('light drizzle');
    });

    it('should handle snow (not rain)', async () => {
      const mockResponse = {
        current: {
          temperature_2m: -2,
          relative_humidity_2m: 75,
          weather_code: 73, // snow
          pressure_msl: 1020,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchWeatherData(49.2827, -123.1207);

      expect(result?.isRaining).toBe(false);
      expect(result?.condition).toBe('snow');
    });

    it('should handle clear weather', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 25,
          relative_humidity_2m: 40,
          weather_code: 0, // clear
          pressure_msl: 1025,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchWeatherData(49.2827, -123.1207);

      expect(result?.isRaining).toBe(false);
      expect(result?.condition).toBe('clear');
    });

    it('should handle thunderstorms as rain', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 22,
          relative_humidity_2m: 80,
          weather_code: 95, // thunderstorm
          pressure_msl: 1000,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchWeatherData(49.2827, -123.1207);

      expect(result?.isRaining).toBe(true);
      expect(result?.condition).toBe('thunderstorm');
    });

    it('should return null when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      const result = await fetchWeatherData(49.2827, -123.1207);

      expect(result).toBeNull();
    });

    it('should return null when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchWeatherData(49.2827, -123.1207);

      expect(result).toBeNull();
    });

    it('should return null when response has no current data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await fetchWeatherData(49.2827, -123.1207);

      expect(result).toBeNull();
    });

    it('should handle partial data gracefully', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 15,
          // missing other fields
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchWeatherData(49.2827, -123.1207);

      expect(result?.temperature).toBe(15);
      expect(result?.humidity).toBeNull();
      expect(result?.pressure).toBeNull();
      expect(result?.weatherCode).toBeNull();
      expect(result?.condition).toBeNull();
      expect(result?.isRaining).toBe(false);
    });

    it('should handle unknown weather codes', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 15,
          weather_code: 999, // unknown code
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchWeatherData(49.2827, -123.1207);

      expect(result?.condition).toBe('unknown');
      expect(result?.isRaining).toBe(false);
    });
  });

  describe('fetchBarometricPressure (legacy)', () => {
    it('should return pressure from full weather data', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          pressure_msl: 1013.25,
          weather_code: 0,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchBarometricPressure(49.2827, -123.1207);

      expect(result).toBe(1013.25);
    });

    it('should return null when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      const result = await fetchBarometricPressure(49.2827, -123.1207);

      expect(result).toBeNull();
    });
  });

  describe('formatWeatherSummary', () => {
    it('should format complete weather data', () => {
      const weather: WeatherData = {
        temperature: 18.7,
        condition: 'partly cloudy',
        pressure: 1015,
        humidity: 65,
        isRaining: false,
        weatherCode: 2,
      };

      const summary = formatWeatherSummary(weather);

      expect(summary).toBe('19°C, partly cloudy, 65% humidity');
    });

    it('should handle rain indicator', () => {
      const weather: WeatherData = {
        temperature: 12,
        condition: 'rain',
        pressure: 1008,
        humidity: 85,
        isRaining: true,
        weatherCode: 63,
      };

      const summary = formatWeatherSummary(weather);

      expect(summary).toContain('12°C');
      expect(summary).toContain('rain');
    });

    it('should handle missing temperature', () => {
      const weather: WeatherData = {
        temperature: null,
        condition: 'cloudy',
        pressure: 1010,
        humidity: 70,
        isRaining: false,
        weatherCode: 3,
      };

      const summary = formatWeatherSummary(weather);

      expect(summary).toBe('cloudy, 70% humidity');
      expect(summary).not.toContain('°C');
    });

    it('should handle missing condition', () => {
      const weather: WeatherData = {
        temperature: 20,
        condition: null,
        pressure: 1015,
        humidity: 50,
        isRaining: false,
        weatherCode: null,
      };

      const summary = formatWeatherSummary(weather);

      expect(summary).toBe('20°C, 50% humidity');
    });

    it('should handle all null values', () => {
      const weather: WeatherData = {
        temperature: null,
        condition: null,
        pressure: null,
        humidity: null,
        isRaining: false,
        weatherCode: null,
      };

      const summary = formatWeatherSummary(weather);

      expect(summary).toBe('Weather data unavailable');
    });
  });
});

// Lightweight weather service to fetch barometric pressure from Open-Meteo
export async function fetchBarometricPressure(lat: number, lon: number): Promise<number | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=pressure_msl&timezone=UTC&forecast_days=1`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    // take the latest hourly value if available
    const values: number[] | undefined = data?.hourly?.pressure_msl;
    if (!values || values.length === 0) return null;
    return values[values.length - 1];
  } catch (e) {
    console.debug('weather: fetch failed', e);
    return null;
  }
}

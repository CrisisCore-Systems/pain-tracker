export async function fetchLocalWeather(_coords?: {lat:number,lon:number}) {
  return { temp: 15, condition: 'clear' };
}

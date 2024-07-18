import {
  City,
  DailyWeatherResponse,
  GeocodeResponse,
  WeatherResponse,
} from "./interfaces.ts";

export async function fetchCityWeather(city: City): Promise<WeatherResponse> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code`
  );
  return await response.json();
}

export async function fetchCity7DayForecast(
  city: City
): Promise<DailyWeatherResponse> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code`
  );
  return await response.json();
}

export async function geocodeCity(cityName: string): Promise<GeocodeResponse> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`
  );
  return await response.json();
}

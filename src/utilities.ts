import { fetchCity7DayForecast, fetchCityWeather } from "./api.ts";
import { City } from "./interfaces.ts";

// fetchAllCitiesWeather();

// fetchForecast();

export const cities: City[] = [
  { name: "New York", latitude: 40.71, longitude: -74.01 },
  { name: "Paris", latitude: 48.85, longitude: 2.35 },
  { name: "Johannesburg", latitude: -26.2, longitude: 28.03 },
  { name: "London", latitude: 51.51, longitude: -0.12 },
];

export async function fetchAllCitiesWeather() {
  for (const city of cities) {
    await fetchCityWeather(city);
  }
}

export function fetchForecast() {
  fetchCity7DayForecast(cities[0]).then((forecast) => {
    console.log("Forecast data:", forecast);
  });
}

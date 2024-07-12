interface WeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    weather_code: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    weather_code: number;
  };
}

interface City {
  name: string;
  latitude: number;
  longitude: number;
}

const cities: City[] = [
  { name: "New York", latitude: 40.71, longitude: -74.01 },
  { name: "Paris", latitude: 48.85, longitude: 2.35 },
  { name: "Johannesburg", latitude: -26.2, longitude: 28.03 },
  { name: "London", latitude: 51.51, longitude: -0.12 },
];

export async function fetchCityWeather(city: City): Promise<WeatherResponse> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code`
  );
  const weatherData: WeatherResponse = await response.json();

  console.log(
    `Current temperature in ${city.name}: ${weatherData.current.temperature_2m}°C`
  );

  return weatherData;
}

export async function fetchAllCitiesWeather() {
  for (const city of cities) {
    await fetchCityWeather(city);
  }
}

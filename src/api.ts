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

interface DailyWeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
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

async function fetchCityWeather(city: City): Promise<WeatherResponse> {
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

export async function fetchCity7DayForecast(
  city: City
): Promise<DailyWeatherResponse> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code`
  );
  const weatherData: DailyWeatherResponse = await response.json();

  console.log(`7-Day Forecast for ${city.name}:`);
  weatherData.daily.time.forEach((date, index) => {
    console.log(
      `Date: ${date}, Max Temp: ${weatherData.daily.temperature_2m_max[index]}°C, Min Temp: ${weatherData.daily.temperature_2m_min[index]}°C, Weather Code: ${weatherData.daily.weather_code[index]}`
    );
  });

  return weatherData;
}

export async function fetchForecast() {
  fetchCity7DayForecast(cities[0]).then((forecast) => {
    console.log("Forecast data:", forecast);
  });
}

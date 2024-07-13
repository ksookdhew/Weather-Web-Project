import { City, DailyWeatherResponse, WeatherResponse } from "./interfaces.ts";

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

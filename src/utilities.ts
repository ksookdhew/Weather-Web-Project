import { fetchCityWeather } from "./api.ts";
import { WEATHER_CODES, WEATHER_ICONS } from "./constants.ts";
import { displayWeatherDetail } from "./dom-manipulation.ts";
import { City } from "./interfaces.ts";

export const cities: City[] = [
  { name: "New York", latitude: 40.71, longitude: -74.01 },
  { name: "Paris", latitude: 48.85, longitude: 2.35 },
  { name: "Johannesburg", latitude: -26.2, longitude: 28.03 },
  { name: "London", latitude: 51.51, longitude: -0.12 },
];

export function getSvgWeatherIcon(path: string): string {
  return `<svg
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0"
      viewBox="0 0 24 24"
      height="40px"
      width="40px"
      xmlns="http://www.w3.org/2000/svg"
      >
        ${path}
     </svg>`;
}

export function getSvgOtherIcon(path: string): string {
  return ` <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 576 512"
        height="20px"
        width="20px"
        xmlns="http://www.w3.org/2000/svg"
      >
        ${path}
     </svg>`;
}

export async function createLocationDiv(city: City): Promise<HTMLDivElement> {
  const cityDiv = document.createElement("div");

  const weatherData = await fetchCityWeather(city);

  cityDiv.className = `flex bg-${
    WEATHER_CODES[weatherData.current.weather_code]
  } w-10/12 justify-between rounded-md p-5 items-center`;

  const cityTitle = document.createElement("h3");
  cityTitle.className = "w-fit";
  cityTitle.innerText = city.name;
  cityDiv.append(cityTitle);

  const weatherDiv = document.createElement("div");
  weatherDiv.className = "flex w-fit gap-4 items-center";

  const weatherIcon = document.createElement("div");
  weatherIcon.innerHTML = getSvgWeatherIcon(
    WEATHER_ICONS[weatherData.current.weather_code]
  );

  const temperature = document.createElement("h2");
  temperature.innerText = `${weatherData.current.temperature_2m.toFixed(0)}°`;

  weatherDiv.append(weatherIcon);
  weatherDiv.append(temperature);
  cityDiv.append(weatherDiv);

  cityDiv.addEventListener("click", () =>
    displayWeatherDetail(city, weatherData)
  );
  return cityDiv;
}

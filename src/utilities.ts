import { fetchCityWeather } from "./api.ts";
import { WEATHER_CODES, WEATHER_ICONS } from "./constants.ts";
import {
  displaySkeleton,
  displayWeather,
  displayWeatherDetail,
} from "./dom-manipulation.ts";
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
      viewBox="0 0 16 16"
      height="30px"
      width="30px"
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

  const cityTitle = document.createElement("h2");
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

export function addRecentlyViewedCity(city: City) {
  let recentlyViewed: City[] = JSON.parse(
    sessionStorage.getItem("recentlyViewed") || "[]"
  );

  const cityExists = recentlyViewed.some(
    (viewedCity) =>
      viewedCity.latitude === city.latitude &&
      viewedCity.longitude === city.longitude
  );

  if (!cityExists) {
    recentlyViewed.unshift(city);
    sessionStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
  }
}

export async function displayRecentlyViewedCities(homeDiv: HTMLElement | null) {
  const recentlyViewed: City[] = JSON.parse(
    sessionStorage.getItem("recentlyViewed") || "[]"
  );

  if (recentlyViewed.length > 0) {
    const recentTitle = document.createElement("h2");
    recentTitle.className = "text-white text-xl px-8 pt-4 self-start";
    recentTitle.innerText = "Recently Viewed";
    homeDiv?.append(recentTitle);

    const limitedRecentlyViewed = recentlyViewed.slice(0, 5);
    const recentData = await Promise.all(
      limitedRecentlyViewed.map(async (city) => await createLocationDiv(city))
    );
    recentData.forEach((locationDiv) => homeDiv?.append(locationDiv));
  }
}

export function createBackButtonDiv() {
  const div = document.createElement("div");
  div.className = "flex justify-start w-8/12 gap-1 items-center text-white";

  const backButton = document.createElement("div");
  backButton.className = "flex justify-center bg-blue-500 p-3 rounded-full";
  backButton.innerHTML = getSvgOtherIcon(
    `<path d="M401.4 224h-214l83-79.4c11.9-12.5 11.9-32.7 0-45.2s-31.2-12.5-43.2 0L89 233.4c-6 5.8-9 13.7-9 22.4v.4c0 8.7 3 16.6 9 22.4l138.1 134c12 12.5 31.3 12.5 43.2 0 11.9-12.5 11.9-32.7 0-45.2l-83-79.4h214c16.9 0 30.6-14.3 30.6-32 .1-18-13.6-32-30.5-32z"></path>`
  );
  backButton.addEventListener("click", () => {
    displaySkeleton();
    displayWeather();
  });

  div.append(backButton);
  return div;
}

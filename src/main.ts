import { fetchCity7DayForecast, fetchCityWeather, geocodeCity } from "./api.ts";
import { cities } from "./constants.ts";
import {
  createCityPlaceholderDiv,
  createDetailDiv,
  createHeaderDiv,
  createHomeDiv,
  createLocationDiv,
  createMapButton,
  createMapDiv,
  createSearchButton,
  createSearchInput,
  displayRecentlyViewedCities,
  initializeMap,
  updateDetailDiv,
} from "./dom-manipulation.ts";
import { City, WeatherResponse } from "./interfaces.ts";
import { createCityFromLatLng, extractCityData } from "./utilities.ts";

displaySkeleton().catch((error) =>
  console.error("Error initializing the app:", error)
);

export async function displaySkeleton() {
  const appDiv = document.querySelector<HTMLDivElement>("#app");
  const detailsDiv = document.querySelector<HTMLDivElement>("#app > div");
  detailsDiv?.remove();

  const homeDiv = createHomeDiv();
  appDiv?.append(homeDiv);

  async function handleSearch() {
    const cityName = searchInput.value.trim();
    if (cityName) {
      try {
        const cityData = await geocodeCity(cityName);
        const city = extractCityData(cityData);

        addRecentlyViewedCity(city);

        const weatherData = await fetchCityWeather(city);
        await displayWeatherDetail(city, weatherData);
      } catch (error) {
        console.error(`Error searching for city '${cityName}':`, error);
      }
    }
  }

  const searchInput = createSearchInput(handleSearch);
  const searchButton = createSearchButton(handleSearch);
  const mapButton = createMapButton();
  const headerDiv = createHeaderDiv([searchInput, searchButton, mapButton]);

  homeDiv.append(headerDiv);
  homeDiv.append(createCityPlaceholderDiv());

  await displayWeather();
}

export async function displayWeather() {
  const homeDiv = document.querySelector<HTMLDivElement>("#home");

  try {
    const citiesData = await Promise.all(
      Object.values(cities).map(async (city) => {
        const weatherData = await fetchCityWeather(city);
        return createLocationDiv(city, weatherData);
      })
    );
    const cityPlaceholder = document.querySelector("#cityPlaceholder");
    cityPlaceholder?.remove();
    citiesData.forEach((cityDiv) => homeDiv?.append(cityDiv));

    const recentlyViewed: City[] = JSON.parse(
      sessionStorage.getItem("recentlyViewed") || "[]"
    );
    const weatherDataList = await Promise.all(
      recentlyViewed.map((city) => fetchCityWeather(city))
    );
    displayRecentlyViewedCities(homeDiv, recentlyViewed, weatherDataList);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

export async function displayWeatherDetail(city: City, today: WeatherResponse) {
  const appDiv = document.querySelector<HTMLDivElement>("#app");
  const homeDiv = document.querySelector<HTMLDivElement>("#app div");
  homeDiv?.remove();

  const detailDiv = createDetailDiv(today);
  appDiv?.append(detailDiv);

  try {
    const weatherDetail = await fetchCity7DayForecast(city);
    updateDetailDiv(detailDiv, city, today, weatherDetail);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

export function map() {
  const appDiv = document.querySelector<HTMLDivElement>("#app");
  const homeDiv = document.querySelector<HTMLDivElement>("#app > div");
  homeDiv?.remove();

  const outerMapDiv = createMapDiv();
  appDiv?.append(outerMapDiv);

  const map = initializeMap();

  map.on("click", async (e) => {
    const { lat, lng } = e.latlng;
    const city = createCityFromLatLng(lat, lng);

    addRecentlyViewedCity(city);

    const weatherData = await fetchCityWeather(city);
    await displayWeatherDetail(city, weatherData);
  });
}

function addRecentlyViewedCity(city: City) {
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

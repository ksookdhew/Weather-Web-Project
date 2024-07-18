import L from "leaflet";
import { fetchCity7DayForecast, fetchCityWeather, geocodeCity } from "./api.ts";
import {
  WEATHER_CODES,
  WEATHER_ICONS,
  WEATHER_IMAGES,
  cities,
  iconPaths,
} from "./constants.ts";
import { City, DailyWeatherResponse, WeatherResponse } from "./interfaces.ts";
import { extractCityData, getSvgIcon } from "./utilities.ts";

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
        displayWeatherDetail(city, weatherData);
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

  function createHomeDiv() {
    const div = document.createElement("div");
    div.id = "home";
    div.className =
      "flex flex-col gap-4 w-full items-center text-white pb-8 max-w-screen-md";

    const pageTitle = document.createElement("h1");
    pageTitle.className = "text-white text-4xl px-8 pt-8 self-start";
    pageTitle.innerText = "Weather";
    div.append(pageTitle);

    return div;
  }

  function createHeaderDiv(children: HTMLElement[]) {
    const div = document.createElement("div");
    div.className = "flex justify-between w-10/12 items-center mb-4 gap-1";
    children.forEach((child) => div.append(child));
    return div;
  }

  function createSearchInput(searchHandler: () => void) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Search city...";
    input.className =
      "flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black";
    input.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        await searchHandler();
      }
    });
    return input;
  }

  function createSearchButton(searchHandler: () => void) {
    const button = document.createElement("div");
    button.className = "flex justify-center bg-blue-500 p-3 rounded-full";
    button.innerHTML = getSvgIcon(`${iconPaths["search"]}`, false);
    button.addEventListener("click", async () => {
      await searchHandler();
    });
    return button;
  }

  function createMapButton() {
    const button = document.createElement("div");
    button.className = "flex justify-center bg-blue-500 p-3 rounded-full";
    button.innerHTML = getSvgIcon(`${iconPaths["map"]}`, false);
    button.addEventListener("click", () => {
      map();
    });
    return button;
  }

  function createCityPlaceholderDiv() {
    const div = document.createElement("div");
    div.id = "cityPlaceholder";
    div.className = "w-full flex flex-col gap-4 items-center";
    const loadingIndicator = document.createElement("h1");
    loadingIndicator.innerText = "Loading...";
    div.append(loadingIndicator);
    for (let i = 0; i < 4; i++) {
      const cityPlaceholder = document.createElement("div");
      cityPlaceholder.className =
        "bg-gray-300 w-10/12 justify-between rounded-md p-5 items-center h-20";
      div.append(cityPlaceholder);
    }
    return div;
  }
}

export async function displayWeather() {
  const homeDiv = document.querySelector<HTMLDivElement>("#home");

  try {
    const citiesData = await Promise.all(
      Object.values(cities).map((city) => createLocationDiv(city))
    );
    const cityPlaceholder = document.querySelector("#cityPlaceholder");
    cityPlaceholder?.remove();
    citiesData.forEach((cityDiv) => homeDiv?.append(cityDiv));

    displayRecentlyViewedCities(homeDiv);
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

  function createDetailDiv(today: WeatherResponse) {
    const div = document.createElement("div");
    div.id = "detail";
    div.className = `flex flex-col w-full items-center h-screen bg-${
      WEATHER_CODES[today.current.weather_code]
    }`;

    const loadingIndicator = document.createElement("h1");
    loadingIndicator.className =
      "flex items-center justify-center w-full h-full loader text-white text-4xl";
    loadingIndicator.innerText = `loading...`;
    div.append(loadingIndicator);

    return div;
  }

  function updateDetailDiv(
    detailDiv: HTMLElement,
    city: City,
    today: WeatherResponse,
    weatherDetail: DailyWeatherResponse
  ) {
    detailDiv.innerHTML = "";

    const todayDiv = createTodayDiv(city, today, weatherDetail);
    detailDiv.append(todayDiv);

    const gridDiv = createGridDiv(weatherDetail, today);
    detailDiv.append(gridDiv);
  }

  function createTodayDiv(
    city: City,
    today: WeatherResponse,
    weatherDetail: DailyWeatherResponse
  ) {
    const div = document.createElement("div");
    div.className = "text-white text-center w-full self-center p-5 h-2/5";
    div.setAttribute(
      "style",
      `background: url("images/${
        WEATHER_IMAGES[today.current.weather_code]
      }") no-repeat center center/cover;`
    );

    const backButtonDiv = createBackButtonDiv();
    div.append(backButtonDiv);

    const cityTitle = document.createElement("h3");
    cityTitle.className = "text-2xl";
    cityTitle.innerText = `${city.name}`;
    div.append(cityTitle);

    const tempElement = document.createElement("h2");
    tempElement.className = "text-4xl";
    tempElement.innerText = `${today.current.temperature_2m.toFixed(0)}°`;
    div.append(tempElement);

    const weatherDescription = document.createElement("h4");
    weatherDescription.className = "text-xl";
    weatherDescription.innerText = `${
      WEATHER_CODES[today.current.weather_code]
    }`;
    div.append(weatherDescription);

    const highLowTemps = document.createElement("h4");
    highLowTemps.className = "text-lg";
    highLowTemps.innerText = `H:${
      weatherDetail.daily.temperature_2m_max?.[0] ?? "Unknown"
    }° L:${weatherDetail.daily.temperature_2m_min?.[0] ?? "Unknown"}°`;
    div.append(highLowTemps);

    return div;
  }

  function createGridDiv(
    weatherDetail: DailyWeatherResponse,
    today: WeatherResponse
  ) {
    const div = document.createElement("div");
    div.className = `w-full grid grid-cols-4 gap-4 text-center text-white p-5 justify-center bg-${
      WEATHER_CODES[today.current.weather_code]
    }`;

    for (let i = 0; i < weatherDetail.daily.time.length; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "contents";

      const dayName = document.createElement("div");
      dayName.className = "text-left";
      dayName.innerText =
        i === 0
          ? "Today"
          : new Date(weatherDetail.daily.time?.[i]).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
              }
            ) ?? "Unknown";
      dayDiv.append(dayName);

      const weatherIconDiv = document.createElement("div");
      weatherIconDiv.className = "place-self-center";
      weatherIconDiv.innerHTML = getSvgIcon(
        WEATHER_ICONS[weatherDetail.daily.weather_code?.[i] ?? 0],
        true
      );
      dayDiv.append(weatherIconDiv);

      const tempMin = document.createElement("div");
      tempMin.innerText = `${
        weatherDetail.daily.temperature_2m_min?.[i] ?? "Unknown"
      }°`;
      dayDiv.append(tempMin);

      const tempMax = document.createElement("div");
      tempMax.innerText = `${
        weatherDetail.daily.temperature_2m_max?.[i] ?? "Unknown"
      }°`;
      dayDiv.append(tempMax);

      div.append(dayDiv);
    }
    return div;
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
    displayWeatherDetail(city, weatherData);
  });

  function createMapDiv() {
    const div = document.createElement("div");
    div.className = "h-screen px-5 w-full";

    const backButtonDiv = createBackButtonDiv();
    const pageTitle = document.createElement("h1");
    pageTitle.className = "text-white text-4xl px-4 py-8";
    pageTitle.innerText = "Weather";
    backButtonDiv.append(pageTitle);
    div.append(backButtonDiv);

    const mapDiv = document.createElement("div");
    mapDiv.id = "mapid";
    mapDiv.className = "h-2/3 rounded-lg";
    div.appendChild(mapDiv);

    return div;
  }

  function initializeMap() {
    const map = L.map("mapid").setView(
      [cities["johannesburg"].latitude, cities["johannesburg"].longitude],
      12
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    return map;
  }

  function createCityFromLatLng(lat: number, lng: number): City {
    return {
      name: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
      latitude: lat,
      longitude: lng,
    };
  }
}

async function createLocationDiv(city: City): Promise<HTMLDivElement> {
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
  weatherIcon.innerHTML = getSvgIcon(
    WEATHER_ICONS[weatherData.current.weather_code],
    true
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

async function displayRecentlyViewedCities(homeDiv: HTMLElement | null) {
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

function createBackButtonDiv() {
  const div = document.createElement("div");
  div.className = "flex justify-start w-8/12 gap-1 items-center text-white";

  const backButton = document.createElement("div");
  backButton.className = "flex justify-center bg-blue-500 p-3 rounded-full";
  backButton.innerHTML = getSvgIcon(`${iconPaths["back"]}`, false);
  backButton.addEventListener("click", () => {
    displaySkeleton();
    displayWeather();
  });

  div.append(backButton);
  return div;
}

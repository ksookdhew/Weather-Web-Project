import L from "leaflet";
import {
  WEATHER_CODES,
  WEATHER_ICONS,
  WEATHER_IMAGES,
  cities,
  iconPaths,
} from "./constants.ts";
import { City, DailyWeatherResponse, WeatherResponse } from "./interfaces.ts";
import { displaySkeleton, displayWeatherDetail, map } from "./main.ts";
import { getSvgIcon } from "./utilities.ts";

export function createHomeDiv() {
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

export function createHeaderDiv(children: HTMLElement[]) {
  const div = document.createElement("div");
  div.className = "flex justify-between w-10/12 items-center mb-4 gap-1";
  children.forEach((child) => div.append(child));
  return div;
}

export function createSearchInput(searchHandler: () => void) {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search city...";
  input.className =
    "flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black";
  input.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      searchHandler();
    }
  });
  return input;
}

export function createSearchButton(searchHandler: () => void) {
  const button = document.createElement("div");
  button.className = "flex justify-center bg-blue-500 p-3 rounded-full";
  button.innerHTML = getSvgIcon(`${iconPaths["search"]}`, false);
  button.addEventListener("click", async () => {
    searchHandler();
  });
  return button;
}

export function createMapButton() {
  const button = document.createElement("div");
  button.className = "flex justify-center bg-blue-500 p-3 rounded-full";
  button.innerHTML = getSvgIcon(`${iconPaths["map"]}`, false);
  button.addEventListener("click", () => {
    map();
  });
  return button;
}

export function createCityPlaceholderDiv() {
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

export function createLocationDiv(
  city: City,
  weatherData: WeatherResponse
): HTMLDivElement {
  const cityDiv = document.createElement("div");

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

export function createBackButtonDiv() {
  const div = document.createElement("div");
  div.className = "flex justify-start w-8/12 gap-1 items-center text-white";

  const backButton = document.createElement("div");
  backButton.className = "flex justify-center bg-blue-500 p-3 rounded-full";
  backButton.innerHTML = getSvgIcon(`${iconPaths["back"]}`, false);
  backButton.addEventListener("click", async () => {
    try {
      await displaySkeleton();
    } catch (error) {
      console.error("Error displaying skeleton:", error);
    }
  });

  div.append(backButton);
  return div;
}

export function createDetailDiv(today: WeatherResponse): HTMLDivElement {
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

export function updateDetailDiv(
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

export function createTodayDiv(
  city: City,
  today: WeatherResponse,
  weatherDetail: DailyWeatherResponse
): HTMLDivElement {
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
  weatherDescription.innerText = `${WEATHER_CODES[today.current.weather_code]}`;
  div.append(weatherDescription);

  const highLowTemps = document.createElement("h4");
  highLowTemps.className = "text-lg";
  highLowTemps.innerText = `H:${
    weatherDetail.daily.temperature_2m_max?.[0] ?? "Unknown"
  }° L:${weatherDetail.daily.temperature_2m_min?.[0] ?? "Unknown"}°`;
  div.append(highLowTemps);

  return div;
}

export function createGridDiv(
  weatherDetail: DailyWeatherResponse,
  today: WeatherResponse
): HTMLDivElement {
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
        : new Date(weatherDetail.daily.time?.[i]).toLocaleDateString("en-US", {
            weekday: "long",
          }) ?? "Unknown";
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

export function displayRecentlyViewedCities(
  homeDiv: HTMLElement | null,
  recentlyViewed: City[],
  weatherDataList: WeatherResponse[]
) {
  if (recentlyViewed.length > 0) {
    const recentTitle = document.createElement("h2");
    recentTitle.className = "text-white text-xl px-8 pt-4 self-start";
    recentTitle.innerText = "Recently Viewed";
    homeDiv?.append(recentTitle);

    const limitedRecentlyViewed = recentlyViewed.slice(0, 5);
    limitedRecentlyViewed.forEach((city, index) => {
      const locationDiv = createLocationDiv(city, weatherDataList[index]);
      homeDiv?.append(locationDiv);
    });
  }
}

export function createMapDiv() {
  const div = document.createElement("div");
  div.className = "h-screen px-5 w-full";

  const backButtonDiv = createBackButtonDiv();
  const pageTitle = document.createElement("h1");
  pageTitle.className = "text-white text-4xl px-4 py-8";
  pageTitle.innerText = "Weather";
  backButtonDiv.append(pageTitle);
  div.append(backButtonDiv);

  const mapDiv = document.createElement("div");
  mapDiv.id = "mapId";
  mapDiv.className = "h-2/3 rounded-lg";
  div.appendChild(mapDiv);

  return div;
}

export function initializeMap() {
  const map = L.map("mapId").setView(
    [cities["johannesburg"].latitude, cities["johannesburg"].longitude],
    12
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  return map;
}

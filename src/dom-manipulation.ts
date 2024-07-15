import L from "leaflet";
import { fetchCity7DayForecast, fetchCityWeather } from "./api.ts";
import { WEATHER_CODES, WEATHER_ICONS, WEATHER_IMAGES } from "./constants.ts";
import { City, WeatherResponse } from "./interfaces.ts";
import {
  cities,
  createLocationDiv,
  getSvgOtherIcon,
  getSvgWeatherIcon,
} from "./utilities.ts";

export async function displayWeather() {
  const detailsDiv = document.querySelector<HTMLDivElement>("#app > div");
  detailsDiv?.remove();

  const appDiv = document.querySelector<HTMLDivElement>("#app");
  const homeDiv = document.createElement("div");
  homeDiv.id = "home";
  homeDiv.className = "flex flex-col gap-4 w-full items-center text-white pb-8";

  const pageTitle = document.createElement("h1");
  pageTitle.className = "text-white text-4xl px-8 pt-8 self-start";
  pageTitle.innerText = "Weather";
  homeDiv?.append(pageTitle);

  const headerDiv = document.createElement("div");
  headerDiv.className = "flex justify-end w-10/12";

  const mapButton = document.createElement("div");
  mapButton.className = "flex justify-center bg-blue-500 p-3 rounded-full";
  mapButton.innerHTML = getSvgOtherIcon(
    `<path d="M0 117.66v346.32c0 11.32 11.43 19.06 21.94 14.86L160 416V32L20.12 87.95A32.006 32.006 0 0 0 0 117.66zM192 416l192 64V96L192 32v384zM554.06 33.16L416 96v384l139.88-55.95A31.996 31.996 0 0 0 576 394.34V48.02c0-11.32-11.43-19.06-21.94-14.86z"></path>`
  );
  mapButton.addEventListener("click", () => {
    map();
  });
  headerDiv.append(mapButton);

  homeDiv?.append(headerDiv);

  for (const city of cities) {
    const cityDiv = await createLocationDiv(city);
    homeDiv.append(cityDiv);
  }

  const recentlyViewed = JSON.parse(
    sessionStorage.getItem("recentlyViewed") || "[]"
  );
  if (recentlyViewed.length > 0) {
    const recentTitle = document.createElement("h2");
    recentTitle.className = "text-white text-xl px-8 pt-4 self-start";
    recentTitle.innerText = "Recently Viewed";
    homeDiv?.append(recentTitle);

    recentlyViewed.forEach(async (city: City) => {
      const locationDiv = await createLocationDiv(city);
      homeDiv.append(locationDiv);
    });
  }
  appDiv?.append(homeDiv);
}

export async function displayWeatherDetail(city: City, today: WeatherResponse) {
  const homeDiv = document.querySelector<HTMLDivElement>("#app div");
  homeDiv?.remove();

  const appDiv = document.querySelector<HTMLDivElement>("#app");
  const detailDiv = document.createElement("div");
  detailDiv.id = "detail";
  detailDiv.className = "flex flex-col w-full items-center h-screen";

  const weatherDetail = await fetchCity7DayForecast(city);

  const todayDiv = document.createElement("div");
  todayDiv.className = "text-white text-center w-full self-center p-8 h-2/5";
  todayDiv.setAttribute(
    "style",
    `background: url("/src/images/${
      WEATHER_IMAGES[today.current.weather_code]
    }") no-repeat center center/cover;`
  );

  const cityTitle = document.createElement("h3");
  cityTitle.className = "text-2xl";
  cityTitle.innerText = `${city.name}`;
  todayDiv.append(cityTitle);

  const tempElement = document.createElement("h2");
  tempElement.className = "text-4xl";
  tempElement.innerText = `${today.current.temperature_2m.toFixed(0)}°`;
  todayDiv.append(tempElement);

  const weatherDescription = document.createElement("h4");
  weatherDescription.className = "text-xl";
  weatherDescription.innerText = `${WEATHER_CODES[today.current.weather_code]}`;
  todayDiv.append(weatherDescription);

  const highLowTemps = document.createElement("h4");
  highLowTemps.className = "text-lg";
  highLowTemps.innerText = `H:${weatherDetail.daily.temperature_2m_max[0]}° L:${weatherDetail.daily.temperature_2m_min[0]}°`;
  todayDiv.append(highLowTemps);

  detailDiv.append(todayDiv);

  const gridDiv = document.createElement("div");
  gridDiv.className = `w-full grid grid-cols-4 gap-4 text-center text-white p-5 justify-center bg-${
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
        : new Date(weatherDetail.daily.time[i]).toLocaleDateString("en-US", {
            weekday: "long",
          });
    dayDiv.append(dayName);

    const weatherIconDiv = document.createElement("div");
    weatherIconDiv.className = "place-self-center";
    weatherIconDiv.innerHTML = getSvgWeatherIcon(
      WEATHER_ICONS[weatherDetail.daily.weather_code[i]]
    );
    dayDiv.append(weatherIconDiv);

    const tempMin = document.createElement("div");
    tempMin.innerText = `${weatherDetail.daily.temperature_2m_min[i]}°`;
    dayDiv.append(tempMin);

    const tempMax = document.createElement("div");
    tempMax.innerText = `${weatherDetail.daily.temperature_2m_max[i]}°`;
    dayDiv.append(tempMax);

    gridDiv.append(dayDiv);
  }

  detailDiv.append(gridDiv);

  const backButtonDiv = document.createElement("div");
  backButtonDiv.className = "flex justify-end w-10/12";

  const backButton = document.createElement("div");
  backButton.className = "flex justify-center bg-blue-500 p-3 rounded-full";
  backButton.innerHTML = getSvgOtherIcon(
    ` <path d="M401.4 224h-214l83-79.4c11.9-12.5 11.9-32.7 0-45.2s-31.2-12.5-43.2 0L89 233.4c-6 5.8-9 13.7-9 22.4v.4c0 8.7 3 16.6 9 22.4l138.1 134c12 12.5 31.3 12.5 43.2 0 11.9-12.5 11.9-32.7 0-45.2l-83-79.4h214c16.9 0 30.6-14.3 30.6-32 .1-18-13.6-32-30.5-32z"></path>`
  );
  backButton.addEventListener("click", () => {
    displayWeather();
  });
  backButtonDiv.append(backButton);

  detailDiv.append(backButtonDiv);

  appDiv?.append(detailDiv);
}

export function map() {
  const appDiv = document.querySelector<HTMLDivElement>("#app");
  const homeDiv = document.querySelector<HTMLDivElement>("#app > #home");
  homeDiv?.remove();

  const outerMapDiv = document.createElement("div");

  const pageTitle = document.createElement("h1");
  pageTitle.className = "text-white text-4xl p-8";
  pageTitle.innerText = "Map";
  outerMapDiv?.append(pageTitle);

  const mapDiv = document.createElement("div");
  mapDiv.id = "mapid";
  mapDiv.style.height = "600px";
  outerMapDiv?.appendChild(mapDiv);
  const backButtonDiv = document.createElement("div");
  backButtonDiv.className = "flex justify-end w-10/12";

  const backButton = document.createElement("div");
  backButton.className = "flex justify-center bg-blue-500 p-3 rounded-full";
  backButton.innerHTML = getSvgOtherIcon(
    ` <path d="M401.4 224h-214l83-79.4c11.9-12.5 11.9-32.7 0-45.2s-31.2-12.5-43.2 0L89 233.4c-6 5.8-9 13.7-9 22.4v.4c0 8.7 3 16.6 9 22.4l138.1 134c12 12.5 31.3 12.5 43.2 0 11.9-12.5 11.9-32.7 0-45.2l-83-79.4h214c16.9 0 30.6-14.3 30.6-32 .1-18-13.6-32-30.5-32z"></path>`
  );
  backButton.addEventListener("click", () => {
    displayWeather();
  });
  backButtonDiv.append(backButton);

  outerMapDiv?.append(backButtonDiv);

  appDiv?.append(outerMapDiv);

  const map = L.map("mapid").setView([-26.2, 28.03], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  map.on("click", async (e) => {
    const { lat, lng } = e.latlng;
    const city: City = {
      name: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
      latitude: lat,
      longitude: lng,
    };

    let recentlyViewed: City[] = JSON.parse(
      sessionStorage.getItem("recentlyViewed") || "[]"
    );
    recentlyViewed.unshift(city);
    sessionStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));

    if (city) {
      const weatherData = await fetchCityWeather(city);
      displayWeatherDetail(city, weatherData);
    }
  });
}

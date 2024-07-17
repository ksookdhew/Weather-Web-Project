import L from "leaflet";
import { fetchCity7DayForecast, fetchCityWeather, geocodeCity } from "./api.ts";
import { WEATHER_CODES, WEATHER_ICONS, WEATHER_IMAGES } from "./constants.ts";
import { City, GeocodeResponse, WeatherResponse } from "./interfaces.ts";
import {
  cities,
  createLocationDiv,
  getSvgOtherIcon,
  getSvgWeatherIcon,
} from "./utilities.ts";

export async function displaySkeleton() {
  const appDiv = document.querySelector<HTMLDivElement>("#app");
  const detailsDiv = document.querySelector<HTMLDivElement>("#app > div");
  detailsDiv?.remove();
  const homeDiv = document.createElement("div");
  homeDiv.id = "home";
  homeDiv.className =
    "flex flex-col gap-4 w-full items-center text-white pb-8 max-w-screen-md";

  const pageTitle = document.createElement("h1");
  pageTitle.className = "text-white text-4xl px-8 pt-8 self-start";
  pageTitle.innerText = "Weather";
  homeDiv?.append(pageTitle);

  const headerDiv = document.createElement("div");
  headerDiv.className = "flex justify-between w-10/12 items-center mb-4 gap-1";

  const searchDiv = document.createElement("div");
  searchDiv.className = "flex justify-start w-10/12 items-center gap-2";
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search city...";
  searchInput.className =
    "flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black";
  searchInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      await handleSearch();
    }
  });
  searchDiv.append(searchInput);

  const searchButton = document.createElement("div");
  searchButton.className = "flex justify-center bg-blue-500 p-3 rounded-full";
  searchButton.innerHTML = getSvgOtherIcon(
    `<path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path>`
  );
  searchButton.addEventListener("click", async () => {
    await handleSearch();
  });

  searchDiv.append(searchButton);
  headerDiv.append(searchDiv);

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

  const cityPlaceholderDiv = document.createElement("div");
  cityPlaceholderDiv.id = "cityPlaceholder";
  cityPlaceholderDiv.className = "w-full flex flex-col gap-4 items-center";
  for (let i = 0; i < 4; i++) {
    const cityPlaceholder = document.createElement("div");
    cityPlaceholder.className =
      "bg-gray-300 w-10/12 justify-between rounded-md p-5 items-center h-20";
    cityPlaceholderDiv.append(cityPlaceholder);
  }
  homeDiv.append(cityPlaceholderDiv);
  appDiv?.append(homeDiv);

  async function handleSearch() {
    const cityName = searchInput.value.trim();
    if (cityName) {
      const cityData: GeocodeResponse = await geocodeCity(cityName);
      const city: City = {
        name: cityData.results[0].name,
        latitude: +cityData.results[0].latitude,
        longitude: +cityData.results[0].longitude,
      };

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
        sessionStorage.setItem(
          "recentlyViewed",
          JSON.stringify(recentlyViewed)
        );
      }

      if (city) {
        const weatherData = await fetchCityWeather(city);
        displayWeatherDetail(city, weatherData);
      } else {
        console.error(`City '${cityName}' not found`);
      }
    }
  }
}

export async function displayWeather() {
  const homeDiv = document.querySelector<HTMLDivElement>("#home");

  try {
    const citiesData = await Promise.all(
      cities.map((city) => createLocationDiv(city))
    );
    const cityPlaceholder = document.querySelector("#cityPlaceholder");
    cityPlaceholder?.remove();
    citiesData.forEach((cityDiv) => homeDiv?.append(cityDiv));

    const recentlyViewed = JSON.parse(
      sessionStorage.getItem("recentlyViewed") || "[]"
    );

    if (recentlyViewed.length > 0) {
      const recentTitle = document.createElement("h2");
      recentTitle.className = "text-white text-xl px-8 pt-4 self-start";
      recentTitle.innerText = "Recently Viewed";
      homeDiv?.append(recentTitle);

      const limitedRecentlyViewed = recentlyViewed.slice(0, 5);

      const recentData = await Promise.all(
        limitedRecentlyViewed.map(async (city: City) => {
          return await createLocationDiv(city);
        })
      );
      recentData.forEach((locationDiv) => homeDiv?.append(locationDiv));
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

export async function displayWeatherDetail(city: City, today: WeatherResponse) {
  const homeDiv = document.querySelector<HTMLDivElement>("#app div");
  homeDiv?.remove();
  const appDiv = document.querySelector<HTMLDivElement>("#app");

  const detailDiv = document.createElement("div");
  detailDiv.id = "detail";
  detailDiv.className = `flex flex-col w-full items-center h-screen bg-${
    WEATHER_CODES[today.current.weather_code]
  }`;

  const loadingIndicator = document.createElement("h1");
  loadingIndicator.className =
    "flex items-center justify-center w-full h-full loader text-white text-4xl";
  loadingIndicator.innerText = `loading...`;
  detailDiv?.append(loadingIndicator);

  appDiv?.append(detailDiv);
  try {
    const weatherDetail = await fetchCity7DayForecast(city);
    loadingIndicator.remove();

    const todayDiv = document.createElement("div");
    todayDiv.className = "text-white text-center w-full self-center p-5 h-2/5";
    todayDiv.setAttribute(
      "style",
      `background: url("public/images/${
        WEATHER_IMAGES[today.current.weather_code]
      }") no-repeat center center/cover;`
    );

    const backButtonDiv = document.createElement("div");
    backButtonDiv.className = "flex justify-start w-10/12";
    const backButton = document.createElement("div");
    backButton.className = "flex justify-center bg-blue-500 p-3 rounded-full";
    backButton.innerHTML = getSvgOtherIcon(
      `<path d="M401.4 224h-214l83-79.4c11.9-12.5 11.9-32.7 0-45.2s-31.2-12.5-43.2 0L89 233.4c-6 5.8-9 13.7-9 22.4v.4c0 8.7 3 16.6 9 22.4l138.1 134c12 12.5 31.3 12.5 43.2 0 11.9-12.5 11.9-32.7 0-45.2l-83-79.4h214c16.9 0 30.6-14.3 30.6-32 .1-18-13.6-32-30.5-32z"></path>`
    );
    backButton.addEventListener("click", () => {
      displaySkeleton();
      displayWeather();
    });
    backButtonDiv.append(backButton);
    todayDiv.append(backButtonDiv);

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
    weatherDescription.innerText = `${
      WEATHER_CODES[today.current.weather_code]
    }`;
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
  } catch (error) {
    console.error("Error fetching weather data:", error);
    loadingIndicator.innerText = "Failed to load data. Please try again.";
  }
}

export function map() {
  const appDiv = document.querySelector<HTMLDivElement>("#app");
  const homeDiv = document.querySelector<HTMLDivElement>("#app > div");
  homeDiv?.remove();

  const outerMapDiv = document.createElement("div");
  outerMapDiv.className = "h-screen px-5 w-full";

  const backButtonDiv = document.createElement("div");
  backButtonDiv.className =
    "flex justify-start w-8/12 gap-1 items-center text-white";
  const backButton = document.createElement("div");
  backButton.className = "flex justify-center bg-blue-500 p-3 rounded-full";
  backButton.innerHTML = getSvgOtherIcon(
    ` <path d="M401.4 224h-214l83-79.4c11.9-12.5 11.9-32.7 0-45.2s-31.2-12.5-43.2 0L89 233.4c-6 5.8-9 13.7-9 22.4v.4c0 8.7 3 16.6 9 22.4l138.1 134c12 12.5 31.3 12.5 43.2 0 11.9-12.5 11.9-32.7 0-45.2l-83-79.4h214c16.9 0 30.6-14.3 30.6-32 .1-18-13.6-32-30.5-32z"></path>`
  );
  backButton.addEventListener("click", () => {
    displaySkeleton();
    displayWeather();
  });
  backButtonDiv.append(backButton);

  const pageTitle = document.createElement("h1");
  pageTitle.className = "text-white text-4xl px-4 py-8";
  pageTitle.innerText = "Map";
  backButtonDiv?.append(pageTitle);

  outerMapDiv?.append(backButtonDiv);

  const mapDiv = document.createElement("div");
  mapDiv.id = "mapid";
  mapDiv.className = "h-2/3 rounded-lg";
  outerMapDiv?.appendChild(mapDiv);

  appDiv?.append(outerMapDiv);

  const map = L.map("mapid").setView([-26.2, 28.03], 12);

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

    const cityExists = recentlyViewed.some(
      (viewedCity) =>
        viewedCity.latitude === city.latitude &&
        viewedCity.longitude === city.longitude
    );

    if (!cityExists) {
      recentlyViewed.unshift(city);
      sessionStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    }

    if (city) {
      const weatherData = await fetchCityWeather(city);
      displayWeatherDetail(city, weatherData);
    }
  });
}
